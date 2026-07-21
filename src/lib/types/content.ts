import type { Component } from 'svelte';

export interface HeroImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  enabled: boolean;
}

export interface TextSegment {
  text: string;
  href?: string;
}

export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  tags: string[];
  cover?: string;
}

export interface ProjectMetadata {
  title: string;
  description: string;
  year: string;
  category: string;
  cover: string;
  order: number;
  draft: boolean;
}

export interface MarkdownModule<T> {
  default: Component;
  metadata: T;
}

export interface Post extends PostMetadata {
  slug: string;
  component: Component;
}

export type PostSummary = Omit<Post, 'component'>;

export interface Project extends ProjectMetadata {
  slug: string;
  component: Component;
}

export type ProjectSummary = Omit<Project, 'component'>;
