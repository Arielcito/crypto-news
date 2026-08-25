import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdminAuth } from '@/lib/admin-auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function describeUploadError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Internal server error';

  if (/private access|private store/i.test(raw)) {
    return 'The BLOB_READ_WRITE_TOKEN of this environment points to a private Blob store. Point it at a store with public access and redeploy.';
  }

  if (/No token found|BLOB_READ_WRITE_TOKEN/i.test(raw)) {
    return 'Missing BLOB_READ_WRITE_TOKEN. Connect a public Vercel Blob store to this project and pull the env vars again.';
  }

  return raw;
}

export async function POST(request: NextRequest) {
  console.log('[POST] /api/admin/upload - Request received');
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ data: null, error: 'Bad request', message: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: 'Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { data: null, error: 'Bad request', message: 'File exceeds the 5MB size limit' },
        { status: 400 }
      );
    }

    const blob = await put(`posts/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    console.log(`[POST] /api/admin/upload - Uploaded to ${blob.url}`);
    return NextResponse.json({ data: { url: blob.url }, error: null, message: 'File uploaded successfully' }, { status: 201 });
  } catch (error) {
    const message = describeUploadError(error);
    console.error('[POST] /api/admin/upload - Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ data: null, error: 'Internal server error', message }, { status: 500 });
  }
}
