/**
 * LRC 歌词解析工具
 * 解析新概念英语 LRC 格式文件
 */

export interface LrcLine {
  time: number;       // 时间（秒）
  english: string;    // 英文内容
  chinese: string;    // 中文翻译
  startTime: string;  // 原始时间字符串 [mm:ss.xx]
}

export interface LrcMetadata {
  album?: string;     // [al:xxx]
  artist?: string;    // [ar:xxx]
  title?: string;     // [ti:xxx]
  by?: string;        // [by:xxx]
}

export interface ParsedLrc {
  metadata: LrcMetadata;
  lines: LrcLine[];
}

/**
 * 解析时间字符串为秒数
 * @param timeStr 时间字符串，格式：mm:ss.xx
 * @returns 秒数
 */
export function parseTimeToSeconds(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\.(\d+)/);
  if (!match) return 0;
  
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const hundredths = parseInt(match[3], 10);
  
  return minutes * 60 + seconds + hundredths / 100;
}

/**
 * 格式化秒数为时间字符串
 * @param seconds 秒数
 * @returns 格式化的时间字符串 mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 解析 LRC 文件内容
 * @param lrcContent LRC 文件内容
 * @returns 解析后的数据
 */
export function parseLrc(lrcContent: string): ParsedLrc {
  // 移除 BOM 标记和规范化换行符
  const cleanContent = lrcContent
    .replace(/^\uFEFF/, '')  // 移除 UTF-8 BOM
    .replace(/\r\n/g, '\n')  // 统一换行符
    .replace(/\r/g, '\n');
  
  const lines = cleanContent.split('\n').filter(line => line.trim());
  const metadata: LrcMetadata = {};
  const lrcLines: LrcLine[] = [];

  console.log('LRC 解析 - 总行数:', lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 解析元数据 - 格式: [al:xxx] [ar:xxx] [ti:xxx] [by:xxx]
    const metaMatch = line.match(/^\[(\w+):(.+)\]$/);
    if (metaMatch) {
      const key = metaMatch[1].toLowerCase();
      const value = metaMatch[2].trim();
      
      switch (key) {
        case 'al':
          metadata.album = value;
          break;
        case 'ar':
          metadata.artist = value;
          break;
        case 'ti':
          metadata.title = value;
          break;
        case 'by':
          metadata.by = value;
          break;
      }
      continue;
    }

    // 解析带时间戳的歌词行
    // 格式: [mm:ss.xx]English text|中文翻译
    // 支持多种时间格式: [00:10.47] 或 [00:10:47] 或 [0:10.47]
    const lyricMatch = line.match(/^\[(\d{1,2}:\d{2}[.:]\d{2})\](.+)$/);
    if (lyricMatch) {
      const timeStr = lyricMatch[1].replace(':', '.').replace(/^(\d+)\./, '$1:'); // 规范化时间格式
      const content = lyricMatch[2];
      
      // 分割英文和中文（用 | 分隔）
      const parts = content.split('|');
      const english = parts[0]?.trim() || '';
      const chinese = parts[1]?.trim() || '';
      
      if (english) {
        lrcLines.push({
          time: parseTimeToSeconds(timeStr),
          english,
          chinese,
          startTime: `[${lyricMatch[1]}]`
        });
      }
    } else if (i < 10) {
      // 只对前10行输出调试信息
      console.log(`LRC 第${i}行未匹配:`, line);
    }
  }

  console.log('LRC 解析 - 匹配行数:', lrcLines.length);

  // 按时间排序
  lrcLines.sort((a, b) => a.time - b.time);

  return {
    metadata,
    lines: lrcLines
  };
}

/**
 * 根据当前播放时间获取当前句子索引
 * @param lines LRC 行数组
 * @param currentTime 当前播放时间（秒）
 * @returns 当前句子索引，-1 表示还未开始
 */
export function getCurrentLineIndex(lines: LrcLine[], currentTime: number): number {
  if (lines.length === 0) return -1;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      return i;
    }
  }
  
  return -1;
}

/**
 * 获取下一句的时间
 * @param lines LRC 行数组
 * @param currentIndex 当前索引
 * @returns 下一句的时间，如果是最后一句则返回 undefined
 */
export function getNextLineTime(lines: LrcLine[], currentIndex: number): number | undefined {
  if (currentIndex < lines.length - 1) {
    return lines[currentIndex + 1].time;
  }
  return undefined;
}

/**
 * 构建 NCE 资源 URL（通过 Flask 后端代理）
 * 使用后端 API 代理解决 CORS 问题
 */
export function buildNCEUrl(book: number, filename: string, type: 'lrc' | 'mp3'): string {
  const encodedFilename = encodeURIComponent(filename);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // 使用 Flask 后端代理接口，避免 CORS 问题
  return `${apiBase}/nce/proxy?book=${book}&filename=${encodedFilename}&type=${type}`;
}

/**
 * 构建 NCE 原始资源 URL（直接访问，可能有 CORS 问题）
 */
export function buildNCEDirectUrl(book: number, filename: string, type: 'lrc' | 'mp3'): string {
  const encodedFilename = encodeURIComponent(filename);
  return `https://nce.szsyw.cn/NCE${book}/${encodedFilename}.${type}`;
}

/**
 * 从文件名中提取课程编号
 */
export function extractLessonNumber(filename: string): string {
  const match = filename.match(/^(\d+)/);
  return match ? match[1] : '';
}

