"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
}

/**
 *
 */
export function RichTextEditor({
  content,
  onChange,
  dir = "ltr",
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    /**
     *
     */
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        dir: dir,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-1 focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 border-b pb-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-sm hover:bg-muted ${editor.isActive("bold") ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-sm hover:bg-muted ${editor.isActive("italic") ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-sm hover:bg-muted ${editor.isActive("bulletList") ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-sm hover:bg-muted ${editor.isActive("orderedList") ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none dark:prose-invert" />
    </div>
  );
}
