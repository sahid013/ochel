/**
 * Script to auto-translate all existing menu items to English
 * Run this once to migrate old menu items
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { translateText } from '../src/lib/translate';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Make sure .env.local exists with:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function translateExistingMenuItems() {
  console.log('🔄 Starting translation of existing menu items...\n');

  try {
    // Fetch all menu items that don't have English translations
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, title, text, description, title_en, text_en, description_en')
      .or('title_en.is.null,text_en.is.null,description_en.is.null');

    if (error) {
      console.error('❌ Error fetching menu items:', error);
      return;
    }

    if (!menuItems || menuItems.length === 0) {
      console.log('✅ All menu items already have English translations!');
      return;
    }

    console.log(`📝 Found ${menuItems.length} menu items to translate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const item of menuItems) {
      try {
        console.log(`Translating: "${item.title}"...`);

        // Only translate if English version is missing
        const titleEn = item.title_en || await translateText(item.title, 'en');
        const textEn = item.text_en || (item.text ? await translateText(item.text, 'en') : null);
        const descriptionEn = item.description_en || (item.description ? await translateText(item.description, 'en') : null);

        // Update the menu item with translations
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            title_en: titleEn,
            text_en: textEn,
            description_en: descriptionEn,
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`  ❌ Failed to update item ${item.id}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`  ✅ Translated successfully`);
          successCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`  ❌ Error translating item ${item.id}:`, err);
        errorCount++;
      }
    }

    console.log('\n📊 Translation Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📝 Total: ${menuItems.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Also translate categories and subcategories
async function translateCategories() {
  console.log('\n🔄 Translating categories...\n');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, title, text, title_en, text_en')
      .or('title_en.is.null,text_en.is.null');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('✅ All categories already have English translations!');
      return;
    }

    console.log(`📝 Found ${categories.length} categories to translate\n`);

    for (const category of categories) {
      try {
        console.log(`Translating category: "${category.title}"...`);

        const titleEn = category.title_en || await translateText(category.title, 'en');
        const textEn = category.text_en || (category.text ? await translateText(category.text, 'en') : null);

        const { error: updateError } = await supabase
          .from('categories')
          .update({
            title_en: titleEn,
            text_en: textEn,
          })
          .eq('id', category.id);

        if (updateError) {
          console.error(`  ❌ Failed:`, updateError.message);
        } else {
          console.log(`  ✅ Success`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`  ❌ Error:`, err);
      }
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

async function translateSubcategories() {
  console.log('\n🔄 Translating subcategories...\n');

  try {
    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('id, title, text, title_en, text_en')
      .or('title_en.is.null,text_en.is.null');

    if (error) {
      console.error('❌ Error fetching subcategories:', error);
      return;
    }

    if (!subcategories || subcategories.length === 0) {
      console.log('✅ All subcategories already have English translations!');
      return;
    }

    console.log(`📝 Found ${subcategories.length} subcategories to translate\n`);

    for (const subcat of subcategories) {
      try {
        console.log(`Translating subcategory: "${subcat.title}"...`);

        const titleEn = subcat.title_en || await translateText(subcat.title, 'en');
        const textEn = subcat.text_en || (subcat.text ? await translateText(subcat.text, 'en') : null);

        const { error: updateError } = await supabase
          .from('subcategories')
          .update({
            title_en: titleEn,
            text_en: textEn,
          })
          .eq('id', subcat.id);

        if (updateError) {
          console.error(`  ❌ Failed:`, updateError.message);
        } else {
          console.log(`  ✅ Success`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`  ❌ Error:`, err);
      }
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run all translations
async function main() {
  console.log('🚀 Starting translation migration...\n');

  await translateCategories();
  await translateSubcategories();
  await translateExistingMenuItems();

  console.log('\n✅ Translation migration complete!');
  process.exit(0);
}

main();
