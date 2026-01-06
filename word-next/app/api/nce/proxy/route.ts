import { NextRequest, NextResponse } from 'next/server';

/**
 * NCE 资源代理接口
 * 解决 CORS 跨域问题
 * 
 * 使用方式:
 * GET /nce/proxy?book=2&filename=02-Breakfast%20or%20Lunch&type=lrc
 * GET /nce/proxy?book=2&filename=02-Breakfast%20or%20Lunch&type=mp3
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const book = searchParams.get('book');
  const filename = searchParams.get('filename');
  const type = searchParams.get('type');

  // 参数验证
  if (!book || !filename || !type) {
    return NextResponse.json(
      { error: '缺少必要参数: book, filename, type' },
      { status: 400 }
    );
  }

  // 验证 type 参数
  if (type !== 'lrc' && type !== 'mp3') {
    return NextResponse.json(
      { error: 'type 参数必须是 lrc 或 mp3' },
      { status: 400 }
    );
  }

  // 验证 book 参数
  const bookNum = parseInt(book);
  if (isNaN(bookNum) || bookNum < 1 || bookNum > 4) {
    return NextResponse.json(
      { error: 'book 参数必须是 1-4 之间的数字' },
      { status: 400 }
    );
  }

  try {
    // 构建外部 URLhttps://nce.ichochy.com/NCE2
    const externalUrl = `https://nce.ichochy.com/NCE${book}/${encodeURIComponent(filename)}.${type}`;
    
    // 请求外部资源
    const response = await fetch(externalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': type === 'lrc' ? 'text/plain' : 'audio/mpeg',
        'Referer': 'https://nce.ichochy.com/',
      },
      // 缓存策略：LRC 文件可以长期缓存，MP3 也可以
      next: { revalidate: 86400 }, // 24小时缓存
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `资源加载失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 根据类型返回不同的响应
    if (type === 'lrc') {
      // LRC 文本文件
      const text = await response.text();
      return new NextResponse(text, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400', // 24小时缓存
        },
      });
    } else {
      // MP3 音频文件 - 流式传输
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
          'Accept-Ranges': 'bytes',
        },
      });
    }
  } catch (error) {
    console.error('代理请求失败:', error);
    return NextResponse.json(
      { error: '代理请求失败' },
      { status: 500 }
    );
  }
}

