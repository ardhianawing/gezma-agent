'use client';

import * as React from 'react';
import Link from 'next/link';
import { UserPlus, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { ManifestEntry } from '@/types/trip';

interface PilgrimOption {
  id: string;
  name: string;
  email: string;
  status: string;
  tripId: string | null;
}

interface ManifestTableProps {
  manifest: ManifestEntry[];
  tripId: string;
  onAddPilgrim: (pilgrimId: string) => void;
  onRemovePilgrim: (pilgrimId: string) => void;
  onUpdateRoom: (pilgrimId: string, roomNumber: string) => void;
  isEditable?: boolean;
}

export function ManifestTable({
  manifest,
  tripId,
  onAddPilgrim,
  onRemovePilgrim,
  onUpdateRoom,
  isEditable = true,
}: ManifestTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [availablePilgrims, setAvailablePilgrims] = React.useState<PilgrimOption[]>([]);
  const [loadingPilgrims, setLoadingPilgrims] = React.useState(false);

  // Fetch available pilgrims when dialog opens
  React.useEffect(() => {
    if (!isDialogOpen) return;

    async function fetchPilgrims() {
      setLoadingPilgrims(true);
      try {
        const res = await fetch('/api/pilgrims?limit=100');
        if (res.ok) {
          const json = await res.json();
          setAvailablePilgrims(json.data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingPilgrims(false);
      }
    }
    fetchPilgrims();
  }, [isDialogOpen]);

  // Filter: not in manifest and not assigned to another trip
  const unassignedPilgrims = availablePilgrims.filter(
    (p) => !manifest.some((m) => m.pilgrimId === p.id) && !p.tripId
  );

  const filteredPilgrims = unassignedPilgrims.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPilgrim = (pilgrimId: string) => {
    onAddPilgrim(pilgrimId);
    setIsDialogOpen(false);
    setSearchQuery('');
  };

  const exportManifest = () => {
    const headers = ['No', 'Name', 'Status', 'Documents', 'Room'];
    const rows = manifest.map((entry, index) => [
      index + 1,
      entry.pilgrimName,
      entry.pilgrimStatus,
      `${entry.documentsComplete}/${entry.documentsTotal}`,
      entry.roomNumber || '-',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest-${tripId}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manifest</CardTitle>
          <p className="text-sm text-[var(--gray-600)] mt-1">
            {manifest.length} pilgrims registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportManifest}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {isEditable && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-[12px] bg-[var(--gezma-red)] text-white text-sm font-medium hover:bg-[var(--gezma-red-hover)] transition-colors">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Pilgrim
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Pilgrim to Manifest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {loadingPilgrims ? (
                      <p className="text-center py-8 text-[var(--gray-600)]">
                        Loading...
                      </p>
                    ) : filteredPilgrims.length === 0 ? (
                      <p className="text-center py-8 text-[var(--gray-600)]">
                        No available pilgrims found
                      </p>
                    ) : (
                      filteredPilgrims.map((pilgrim) => (
                        <div
                          key={pilgrim.id}
                          className="flex items-center justify-between p-3 rounded-[12px] border border-[var(--gray-border)] hover:bg-[var(--gray-100)]"
                        >
                          <div>
                            <p className="font-medium text-sm text-[var(--charcoal)]">{pilgrim.name}</p>
                            <p className="text-xs text-[var(--gray-600)]">{pilgrim.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={pilgrim.status as 'lead' | 'dp' | 'lunas'} size="sm" />
                            <Button size="sm" onClick={() => handleAddPilgrim(pilgrim.id)}>
                              Add
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {manifest.length === 0 ? (
          <div className="text-center py-8 text-[var(--gray-600)]">
            <p>No pilgrims in manifest yet.</p>
            {isEditable && <p className="text-sm mt-1">Click &quot;Add Pilgrim&quot; to start adding.</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Pilgrim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifest.map((entry, index) => (
                <TableRow key={entry.pilgrimId}>
                  <TableCell className="font-mono text-[var(--gray-600)]">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-[var(--charcoal)]">{entry.pilgrimName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.pilgrimStatus} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-[var(--gray-200)]">
                        <div
                          className="h-2 rounded-full bg-[var(--success)]"
                          style={{ width: `${(entry.documentsComplete / entry.documentsTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--gray-600)]">
                        {entry.documentsComplete}/{entry.documentsTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditable ? (
                      <Input
                        value={entry.roomNumber || ''}
                        onChange={(e) => onUpdateRoom(entry.pilgrimId, e.target.value)}
                        placeholder="Room #"
                        className="w-20 h-8 text-sm"
                      />
                    ) : (
                      <span className="text-sm">{entry.roomNumber || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/pilgrims/${entry.pilgrimId}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-[var(--error)]"
                          onClick={() => onRemovePilgrim(entry.pilgrimId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
