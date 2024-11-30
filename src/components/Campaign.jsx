'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cross } from '@/components/ui/cross';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LinkIcon } from '@heroicons/react/24/outline';
import { getConnectionName } from '@/lib/utils/connections';

const platformStyles = {
  facebook: 'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
  twitter: 'bg-sky-100 text-sky-800',
  linkedin: 'bg-indigo-100 text-indigo-800'
};

export default function Campaign({ 
  id, 
  name, 
  description, 
  startDate, 
  endDate, 
  platforms,
  connection,
  onDelete,
  isActive,
  onActivate,
  isLoading 
}) {
  const router = useRouter();
  const [deleteState, setDeleteState] = useState(false);
  const [activating, setActivating] = useState(false);
  const connectionName = getConnectionName(connection);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (deleteState) {
      onDelete(id);
    } else {
      setDeleteState(true);
      setTimeout(() => {
        setDeleteState(false);
      }, 3000);
    }
  };

  const handleActivate = async () => {
    if (activating) return;
    
    try {
      setActivating(true);
      if (onActivate) {
        await onActivate(id);
      }
    } catch (error) {
      console.error('Error activating campaign:', error);
    } finally {
      setActivating(false);
    }
  };

  const handleMouseLeave = () => {
    setDeleteState(false);
  };

  const handleClick = () => {
    if (!isLoading && !activating) {
      router.push(`/campaign/${id}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  return (
    <div 
      className={`aspect-square bg-card border border-border rounded-lg overflow-hidden shadow-lg transition-shadow relative group
        ${!isLoading && !activating && 'hover:shadow-xl cursor-pointer'}
        ${(isLoading || activating) && 'opacity-75'}`}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {(isLoading || activating) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LinkIcon className="h-4 w-4" />
            <span className="text-sm">{connectionName}</span>
          </div>
          {!isLoading && !activating && (
            <Button
              variant={deleteState ? "destructive" : "ghost"}
              size="sm"
              className={`h-9 ${deleteState ? 'min-w-[4rem]' : 'w-9'} hover:bg-${deleteState ? 'destructive/90' : 'background/90'} hover:text-${deleteState ? 'destructive-foreground' : 'foreground'}`}
              onClick={handleDelete}
            >
              {deleteState ? (
                <span className="text-sm font-medium">really?</span>
              ) : (
                <Cross className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-medium text-foreground truncate">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</span>
            <Switch
              checked={isActive}
              onCheckedChange={handleActivate}
              onClick={(e) => e.stopPropagation()}
              disabled={activating}
              className={`data-[state=checked]:bg-green-500 ${activating ? 'opacity-50 cursor-wait' : ''}`}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
        
        <div className="flex gap-2 mb-4">
          {platforms.map((platform) => (
            <Badge 
              key={platform}
              variant="secondary"
              className={platformStyles[platform]}
            >
              {platform}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-1">
          <p className="text-sm text-muted-foreground flex justify-between">
            <span>Start:</span>
            <span>{formatDate(startDate)}</span>
          </p>
          <p className="text-sm text-muted-foreground flex justify-between">
            <span>End:</span>
            <span>{formatDate(endDate)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
