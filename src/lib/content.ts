import { supabase } from './supabase';

// Retrieve website content
export async function getSiteContent<T = Record<string, unknown>>(
  contentKey: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('content_key', contentKey)
    .maybeSingle();

  if (error) {
    console.error('Error loading website content:', error);
    throw error;
  }

  return data ? (data.content_value as T) : null;
}

// Save or update website content
export async function saveSiteContent(
  contentKey: string,
  contentValue: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert(
      {
        content_key: contentKey,
        content_value: contentValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'content_key' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving website content:', error);
    throw error;
  }

  return data;
}

// Retrieve all website content
export async function getAllSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('content_key');

  if (error) {
    console.error('Error loading website content:', error);
    throw error;
  }

  return data;
}
