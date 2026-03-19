import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeDB } from '@/lib/db';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ message: 'No data dir found' });
    }

    const files = fs.readdirSync(dataDir);
    const results = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const name = file.replace('.json', '');
        const filePath = path.join(dataDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        try {
          const parsed = JSON.parse(raw);
          // Firestore에 적재
          await writeDB(name, parsed);
          results.push(`Successfully migrated: ${name} (${parsed.length} items)`);
        } catch (err) {
          results.push(`Failed to parse: ${name}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
