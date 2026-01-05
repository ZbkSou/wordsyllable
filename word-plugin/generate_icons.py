#!/usr/bin/env python3
"""
图标生成脚本
使用 PIL (Pillow) 生成简单的插件图标
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("❌ 缺少 Pillow 库！")
    print("请运行: pip install Pillow")
    exit(1)

def create_icon(size, output_path):
    """创建一个渐变背景的图标，带有文字"""
    # 创建图像
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变背景（从紫色到蓝色）
    for y in range(size):
        # 计算渐变色
        ratio = y / size
        r = int(102 + (118 - 102) * ratio)
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # 添加文字
    try:
        # 尝试使用系统字体
        if size >= 48:
            font_size = size // 2
            try:
                # Windows
                font = ImageFont.truetype("msyh.ttc", font_size)
            except:
                try:
                    # Linux
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
                except:
                    try:
                        # Mac
                        font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", font_size)
                    except:
                        font = ImageFont.load_default()
        else:
            font = ImageFont.load_default()
        
        # 绘制文字（书的emoji或"词"字）
        text = "📚" if size >= 48 else "W"
        
        # 获取文字边界框
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # 计算居中位置
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # 绘制白色文字
        draw.text((x, y), text, fill='white', font=font)
    except Exception as e:
        print(f"⚠️  添加文字时出错: {e}")
        # 如果文字添加失败，绘制一个简单的圆圈
        margin = size // 4
        draw.ellipse([margin, margin, size - margin, size - margin], 
                    outline='white', width=max(2, size // 20))
    
    # 保存图像
    img.save(output_path, 'PNG')
    print(f"✅ 已创建: {output_path} ({size}x{size})")

def main():
    """生成所有需要的图标"""
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')
    
    # 创建 icons 目录（如果不存在）
    os.makedirs(icons_dir, exist_ok=True)
    
    print("🎨 开始生成图标...")
    print(f"📁 输出目录: {icons_dir}")
    print()
    
    # 生成三个尺寸的图标
    sizes = [16, 48, 128]
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, output_path)
    
    print()
    print("🎉 所有图标已生成完成！")
    print("📝 现在可以加载插件到 Chrome 了")
    print()
    print("下一步：")
    print("1. 打开 Chrome: chrome://extensions/")
    print("2. 开启 '开发者模式'")
    print("3. 点击 '加载已解压的扩展程序'")
    print(f"4. 选择文件夹: {script_dir}")

if __name__ == '__main__':
    main()


