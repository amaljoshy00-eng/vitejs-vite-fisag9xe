import { supabase } from './supabase';

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  visible: boolean;
};

export type NewSocialLink = Omit<SocialLink, 'id'>;

// PUBLIC: Get contact links that are visible on the website
export async function getVisibleSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('visible', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return data as SocialLink[];
}

// ADMIN: Get all contact links
export async function getAdminSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;

  return data as SocialLink[];
}

// ADMIN: Add a contact link
export async function addSocialLink(link: NewSocialLink) {
  const { data, error } = await supabase
    .from('social_links')
    .insert(link)
    .select()
    .single();

  if (error) throw error;

  return data as SocialLink;
}

// ADMIN: Update a contact link
export async function updateSocialLink(
  id: string,
  updates: Partial<NewSocialLink>
) {
  const { data, error } = await supabase
    .from('social_links')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as SocialLink;
}

// ADMIN: Delete a contact link
export async function deleteSocialLink(id: string) {
  const { error } = await supabase.from('social_links').delete().eq('id', id);

  if (error) throw error;
}
