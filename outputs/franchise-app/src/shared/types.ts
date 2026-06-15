export type Role = "owner" | "methodist" | "admin" | "coach";

export type Article = {
  id: string;
  title: string;
  category: string;
  html: string;
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
};

export type LessonGroup = {
  id: string;
  title: string;
  course: string;
  age: string;
  updated: string;
  materials: Article[];
};
