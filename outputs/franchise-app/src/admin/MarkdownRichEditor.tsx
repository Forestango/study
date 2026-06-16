import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useEffect, useMemo, useRef } from "react";
import { getImagesAsync, setImagesAsync } from "../data/storage";

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

const imageIdFromSource = (source: string) => source.match(/^franchise-image:(.+)$/)?.[1];

export function MarkdownRichEditor({ value = "", onChange }: Props) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const lastEditorValue = useRef(value);

  useEffect(() => {
    if (!editorRef.current || value === lastEditorValue.current) return;
    lastEditorValue.current = value;
    editorRef.current.setMarkdown(value);
  }, [value]);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          txt: "Text",
          js: "JavaScript",
          ts: "TypeScript",
          tsx: "TSX",
          css: "CSS",
          html: "HTML",
          json: "JSON",
        },
        autoLoadLanguageSupport: false,
      }),
      imagePlugin({
        imageUploadHandler: async (file) => {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(String(reader.result || "")));
            reader.addEventListener("error", () => reject(reader.error));
            reader.readAsDataURL(file);
          });
          const id = crypto.randomUUID();
          const images = await getImagesAsync();
          await setImagesAsync({
            ...images,
            [id]: {
              name: file.name,
              caption: file.name.replace(/\.[^.]+$/, ""),
              src: dataUrl,
            },
          });
          return `franchise-image:${id}`;
        },
        imagePreviewHandler: async (source) => {
          const id = imageIdFromSource(source);
          if (!id) return source;
          const images = await getImagesAsync();
          return images[id]?.src || source;
        },
        disableImageResize: true,
      }),
      diffSourcePlugin({ viewMode: "rich-text" }),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper options={["rich-text", "source"]}>
            <UndoRedo />
            <Separator />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <Separator />
            <ListsToggle options={["bullet", "number"]} />
            <CreateLink />
            <InsertImage />
            <Separator />
            <InsertTable />
            <InsertThematicBreak />
            <InsertCodeBlock />
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="markdown-editor-shell">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        contentEditableClassName="markdown-editor-content"
        plugins={plugins}
        spellCheck
        onChange={(nextValue) => {
          lastEditorValue.current = nextValue;
          onChange(nextValue);
        }}
      />
    </div>
  );
}
