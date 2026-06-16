export type Role = "owner" | "methodist" | "admin" | "coach";

export type LessonTreeNodeType = "folder" | "lesson" | "material";

export type LessonTreeNode = {
  id: string;
  parentId?: string;
  type: LessonTreeNodeType;
  title: string;
  order: number;
  articleId?: string;
  roles?: Role[];
};

export type AuditEvent = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  createdAt: string;
};

export type StoredFile = {
  id: string;
  name: string;
  description?: string;
  mimeType: string;
  size: number;
  src: string;
  articleIds: string[];
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  category: string;
  html: string;
  markdown?: string;
  bodyFormat?: "html" | "markdown";
  updated: string;
  roles: Role[];
  summary?: string;
  tags?: string[];
  contentType?: "article" | "lesson";
  lessonId?: string;
  lessonTitle?: string;
  lessonCourse?: string;
  lessonAge?: string;
  lessonOrder?: number;
  materialType?: string;
  fileIds?: string[];
};

export type LessonGroup = {
  id: string;
  title: string;
  course: string;
  age: string;
  updated: string;
  materials: Article[];
};
