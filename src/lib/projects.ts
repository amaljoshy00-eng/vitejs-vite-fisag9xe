import { supabase } from './supabase';

export type Project = {
  id: string;
  title: string;
  category: string;
  youtube_url: string;
  thumbnail_url: string;
  project_type: 'regular' | 'short';
  sort_order: number;
  featured: boolean;
  published: boolean;
};

export type NewProject = Omit<Project, 'id'>;

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data as Project[];
}

// ADMIN: Retrieve all projects, including unpublished ones
export async function getAdminProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data as Project[];
}

// ADMIN: Add a new project
export async function addProject(project: NewProject) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;

  return data as Project;
}

// ADMIN: Update an existing project
export async function updateProject(id: string, updates: Partial<NewProject>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as Project;
}

// ADMIN: Delete a project
export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw error;
}
