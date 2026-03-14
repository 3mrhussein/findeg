"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  MoreVertical,
  Trash,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tag, TagScope } from "@/features/catalog/domain/entities/Tag";
import { TagBadge } from "@/components/shared/TagBadge";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  adminUpdateTagAction,
  adminDeleteTagAction,
  adminBulkUpdateTagsStatusAction,
  adminBulkDeleteTagsAction,
} from "@/features/administration/application/actions/admin-tag-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TagsTableProps {
  tags: Tag[];
  groups: string[];
  onEdit: (tag: Tag) => void;
  onNew: () => void;
}

/**
 *
 */
export function TagsTable({ tags, groups, onEdit, onNew }: TagsTableProps) {
  const t = useTranslations("Pages.Dashboard.Tags");
  const commonT = useTranslations("Pages.Dashboard.Table");
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Filter logic
  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.key.toLowerCase().includes(search.toLowerCase()) ||
      tag.group.toLowerCase().includes(search.toLowerCase());

    const matchesGroup = groupFilter === "all" || tag.group === groupFilter;
    const matchesScope = scopeFilter === "all" || tag.scope === scopeFilter;

    return matchesSearch && matchesGroup && matchesScope;
  });

  /**
   *
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTags.map((t) => t.id as number));
    } else {
      setSelectedIds([]);
    }
  };

  /**
   *
   */
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  /**
   *
   */
  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    // Optimistic UI could be added here if needed, but for now simple action
    const result = await adminBulkUpdateTagsStatusAction([id], !currentStatus);
    if (result.success) {
      toast({ title: "Status updated" });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  /**
   *
   */
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const result = await adminDeleteTagAction(deleteConfirmId);
    if (result.success) {
      toast({ title: "Tag deleted" });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setDeleteConfirmId(null);
  };

  /**
   *
   */
  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    const result = await adminBulkUpdateTagsStatusAction(selectedIds, isActive);
    if (result.success) {
      toast({ title: `Bulk ${isActive ? "activate" : "deactivate"} successful` });
      setSelectedIds([]);
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  /**
   *
   */
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await adminBulkDeleteTagsAction(selectedIds);
    if (result.success) {
      toast({ title: "Bulk delete successful" });
      setSelectedIds([]);
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsBulkDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("SearchPlaceholder")}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("AllGroups")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("AllGroups")}</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("AllScopes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("AllScopes")}</SelectItem>
              <SelectItem value="catalog">Catalog</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onNew}>
            <Plus className="mr-2 h-4 w-4" /> {t("NewTag")}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md border animate-in fade-in slide-in-from-top-1">
          <span className="text-sm font-medium ml-2">{selectedIds.length} items selected</span>
          <Button variant="outline" size="sm" onClick={() => handleBulkStatus(true)}>
            <CheckCircle className="mr-2 h-4 w-4" /> Activate
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkStatus(false)}>
            <XCircle className="mr-2 h-4 w-4" /> Deactivate
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === filteredTags.length && filteredTags.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>{commonT("Tag")}</TableHead>
              <TableHead>{commonT("Group")}</TableHead>
              <TableHead>{commonT("Key")}</TableHead>
              <TableHead>{commonT("Scope")}</TableHead>
              <TableHead>{commonT("Active")}</TableHead>
              <TableHead className="text-right">{commonT("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(tag.id as number)}
                    onCheckedChange={(checked) => handleSelectOne(tag.id as number, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <TagBadge tag={tag} />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                    {tag.group}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{tag.key}</TableCell>
                <TableCell className="capitalize text-xs">{tag.scope}</TableCell>
                <TableCell>
                  <Switch
                    checked={tag.isActive}
                    onCheckedChange={() => handleStatusToggle(tag.id as number, tag.isActive)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tag)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirmId(tag.id as number)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTags.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No tags found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tag and remove it from
              all associated products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} tags?</DialogTitle>
            <DialogDescription>
              This will permanently delete multiple tags. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete All Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
