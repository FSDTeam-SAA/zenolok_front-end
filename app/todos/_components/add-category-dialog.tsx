"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { colorPalette } from "@/lib/presets";

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  newCategoryColor: string;
  onNewCategoryColorChange: (value: string) => void;
  onCreate: () => void;
  isCreating: boolean;
};

export function AddCategoryDialog({
  open,
  onOpenChange,
  newCategoryName,
  onNewCategoryNameChange,
  newCategoryColor,
  onNewCategoryColorChange,
  onCreate,
  isCreating,
}: AddCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-[#BEC6D7] text-[#8C94A6] transition hover:bg-[#ECF1F9]"
          aria-label="Add category"
        >
          <Plus className="size-7" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl rounded-[30px] border border-[#DAE0EB] bg-[#F5F7FC] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-[40px]">New Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-white"
            style={{ backgroundColor: newCategoryColor }}
          >
            <span className="font-poppins text-[32px] leading-[120%] font-semibold">
              {newCategoryName.trim() || "Work"}
            </span>
          </div>

          <Input
            value={newCategoryName}
            onChange={(event) => onNewCategoryNameChange(event.target.value)}
            placeholder="Category name"
            className="h-12"
          />

          <div className="rounded-3xl border border-[#DEE4EF] bg-[#EEF2F8] p-4">
            <div className="grid grid-cols-10 gap-2 sm:gap-3">
              {colorPalette.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => onNewCategoryColorChange(color)}
                  className={`size-8 rounded-full border-2 sm:size-10 ${
                    newCategoryColor === color ? "border-[#283040]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            className="font-poppins h-11 rounded-xl px-6 text-[20px] leading-[120%] font-medium"
            onClick={onCreate}
            disabled={isCreating}
          >
            {isCreating ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
