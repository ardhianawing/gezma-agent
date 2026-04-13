import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { mkdtempSync } from 'fs';
import path from 'path';
import os from 'os';
import { getPresignedDownloadUrl } from '@/lib/storage-multipart';
import { getStorage } from '@/lib/storage';

const execFileAsync = promisify(execFile);

export async function generateThumbnail(
  lessonId: string,
  videoStorageKey: string
): Promise<{ thumbnailKey: string; videoDuration: number }> {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'gezma-thumb-'));
  const videoPath = path.join(tmpDir, 'input.mp4');
  const thumbPath = path.join(tmpDir, 'thumb.jpg');

  try {
    // Download video from S3
    const videoUrl = await getPresignedDownloadUrl(videoStorageKey, 300);
    const response = await fetch(videoUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(videoPath, buffer);

    // Get video duration
    const { stdout: probeOut } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ]);
    const videoDuration = Math.round(parseFloat(probeOut.trim()));

    // Generate thumbnail at 5 seconds (or 1 second if video is shorter)
    const seekTo = Math.min(5, Math.max(1, videoDuration - 1));
    await execFileAsync('ffmpeg', [
      '-i', videoPath,
      '-ss', String(seekTo),
      '-vframes', '1',
      '-q:v', '2',
      '-vf', 'scale=640:-1',
      thumbPath,
    ]);

    // Upload thumbnail to S3
    const thumbnailKey = `academy/thumbnails/${lessonId}.jpg`;
    const thumbBuffer = await readFile(thumbPath);
    const storage = getStorage();
    await storage.upload(thumbnailKey, thumbBuffer, 'image/jpeg');

    return { thumbnailKey, videoDuration };
  } finally {
    await unlink(videoPath).catch(() => {});
    await unlink(thumbPath).catch(() => {});
  }
}
