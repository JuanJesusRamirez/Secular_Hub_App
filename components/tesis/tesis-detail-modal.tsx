"use client";

import { TesisRecord } from "@/app/api/tesis/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Calendar, Hash, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TesisDetailModalProps {
  record: TesisRecord;
  onClose: () => void;
}

export function TesisDetailModal({ record, onClose }: TesisDetailModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {record.year}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Hash className="h-3 w-3" />
                  Rank {record.rank}
                </Badge>
                <Badge variant="default" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {record.themesAssets}
                </Badge>
              </div>
              <CardTitle className="text-xl">
                {record.themesAssets} - {record.year}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Consensus Thesis */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              📊 Consensus Thesis
            </h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {record.consensusThesis || 'No consensus thesis available'}
              </p>
            </div>
          </div>

          {/* Tesis Ex Post */}
          {record.tesisExPost && (
            <div>
              <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wide">
                ✅ Actual Outcome (Tesis Ex Post)
              </h3>
              <div className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-orange-900 dark:text-orange-200 whitespace-pre-wrap">
                  {record.tesisExPost}
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
