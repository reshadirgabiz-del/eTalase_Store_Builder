import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SupabaseService implements OnModuleInit {
  client: SupabaseClient;

  onModuleInit() {

    const url = "https://rjooyyopugjwqwceigwo.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqb295eW9wdWdqd3F3Y2VpZ3dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIwNjM5MywiZXhwIjoyMDk0NzgyMzkzfQ.Wk0ENVeM1d8nreGpATbukF4chufF2gZvgchGvBNB1fc";
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    this.client = createClient(url, key);
  }

  async resolveStoreId(storeKey: string): Promise<string | null> {
    if (UUID_RE.test(storeKey)) return storeKey;

    const { data } = await this.client
      .from('stores')
      .select('id')
      .eq('public_store_key', storeKey)
      .maybeSingle();

    return data?.id ?? null;
  }
}
