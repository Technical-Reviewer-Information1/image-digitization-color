import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from PIL import Image, ImageDraw
import numpy as np
import io
import base64

st.set_page_config(page_title="画像のデジタル表現②画像や色の表現", layout="wide")

st.title("画像のデジタル表現②画像や色の表現")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

st.write("このアプリケーションでは、画像のデジタル表現と色表現について体験的に学ぶことができます。")

# 1. ラスタ形式とベクタ形式の比較
st.header("1. ラスタ形式とベクタ形式の比較")
st.write("同じ図形をラスタ形式（ビットマップ）とベクタ形式で表現し、拡大時の違いを比較してみましょう。")

# 図形選択
shape_type = st.selectbox("図形を選択してください", ["円", "四角形", "三角形"])

# 拡大倍率スライダー
zoom_factor = st.slider("拡大倍率", min_value=1, max_value=10, value=1, step=1)

def create_raster_image(shape_type, size=200, zoom_factor=1):
    """ラスタ形式の画像を生成"""
    img_size = size // zoom_factor  # 拡大する際は小さい画像から始める
    img = Image.new('RGBA', (img_size, img_size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    center = img_size // 2
    radius = img_size // 4
    
    if shape_type == "円":
        draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                    fill=(0, 100, 255, 255), outline=(0, 50, 200, 255), width=2)
    elif shape_type == "四角形":
        draw.rectangle([center-radius, center-radius, center+radius, center+radius], 
                      fill=(0, 100, 255, 255), outline=(0, 50, 200, 255), width=2)
    elif shape_type == "三角形":
        points = [(center, center-radius), 
                 (center-radius, center+radius), 
                 (center+radius, center+radius)]
        draw.polygon(points, fill=(0, 100, 255, 255), outline=(0, 50, 200, 255), width=2)
    
    # 拡大処理（ピクセルが粗くなる）
    if zoom_factor > 1:
        img = img.resize((size, size), Image.NEAREST)
    
    return img

def create_vector_visualization(shape_type, size=200, zoom_factor=1):
    """ベクタ形式の図形をPlotlyで可視化"""
    fig = go.Figure()
    
    center = 0
    radius = 1 / zoom_factor  # ズーム時は相対的に小さくして、表示領域で拡大効果を演出
    
    if shape_type == "円":
        theta = np.linspace(0, 2*np.pi, 100)
        x = center + radius * np.cos(theta)
        y = center + radius * np.sin(theta)
        fig.add_trace(go.Scatter(x=x, y=y, fill="toself", 
                                fillcolor="rgba(0, 100, 255, 0.7)",
                                line=dict(color="rgba(0, 50, 200, 1)", width=3),
                                showlegend=False, hoverinfo='none'))
    elif shape_type == "四角形":
        x = [center-radius, center+radius, center+radius, center-radius, center-radius]
        y = [center-radius, center-radius, center+radius, center+radius, center-radius]
        fig.add_trace(go.Scatter(x=x, y=y, fill="toself", 
                                fillcolor="rgba(0, 100, 255, 0.7)",
                                line=dict(color="rgba(0, 50, 200, 1)", width=3),
                                showlegend=False, hoverinfo='none'))
    elif shape_type == "三角形":
        x = [center, center-radius, center+radius, center]
        y = [center-radius, center+radius, center+radius, center-radius]
        fig.add_trace(go.Scatter(x=x, y=y, fill="toself", 
                                fillcolor="rgba(0, 100, 255, 0.7)",
                                line=dict(color="rgba(0, 50, 200, 1)", width=3),
                                showlegend=False, hoverinfo='none'))
    
    # 拡大に応じて表示範囲を調整
    axis_range = 1.5 / zoom_factor
    fig.update_layout(
        xaxis=dict(range=[-axis_range, axis_range], showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(range=[-axis_range, axis_range], showgrid=False, showticklabels=False, zeroline=False, scaleanchor="x"),
        showlegend=False,
        plot_bgcolor='white',
        paper_bgcolor='white',
        width=size,
        height=size,
        margin=dict(l=0, r=0, t=0, b=0)
    )
    
    return fig

# 2列レイアウトで比較表示
col1, col2 = st.columns(2)

with col1:
    st.subheader("ラスタ形式（ビットマップ）")
    raster_img = create_raster_image(shape_type, 300, zoom_factor)
    st.image(raster_img, caption=f"拡大倍率: {zoom_factor}x", width=300)
    if zoom_factor > 3:
        st.warning("⚠️ ピクセルが粗くなり、ジャギー（ギザギザ）が発生しています")

with col2:
    st.subheader("ベクタ形式")
    vector_fig = create_vector_visualization(shape_type, 300, zoom_factor)
    st.plotly_chart(vector_fig, use_container_width=False)
    if zoom_factor > 3:
        st.success("✅ 拡大しても滑らかな曲線・直線が維持されています")

# 拡大倍率による違いの説明
if zoom_factor == 1:
    st.info("スライダーを動かして拡大してみてください。拡大倍率が上がると違いがはっきりと見えてきます。")
elif zoom_factor <= 3:
    st.info("少しずつ違いが見えてきました。さらに拡大してみてください。")
else:
    st.info("ラスタ形式とベクタ形式の違いが明確に見えています！")

st.divider()

# 2. 加法混色（RGB）の体験
st.header("2. 加法混色（RGB）の体験")
st.write("赤（R）、緑（G）、青（B）の光を組み合わせて色を作ってみましょう。")

# session stateの初期化
if 'r_value' not in st.session_state:
    st.session_state.r_value = 128
if 'g_value' not in st.session_state:
    st.session_state.g_value = 128
if 'b_value' not in st.session_state:
    st.session_state.b_value = 128

# RGB スライダー
col1, col2, col3 = st.columns(3)

with col1:
    r_value = st.slider("赤 (Red)", min_value=0, max_value=255, value=st.session_state.r_value, key="red")
    st.session_state.r_value = r_value
    st.markdown(f"<div style='background-color: rgb({r_value}, 0, 0); height: 30px; border-radius: 5px;'></div>", unsafe_allow_html=True)

with col2:
    g_value = st.slider("緑 (Green)", min_value=0, max_value=255, value=st.session_state.g_value, key="green")
    st.session_state.g_value = g_value
    st.markdown(f"<div style='background-color: rgb(0, {g_value}, 0); height: 30px; border-radius: 5px;'></div>", unsafe_allow_html=True)

with col3:
    b_value = st.slider("青 (Blue)", min_value=0, max_value=255, value=st.session_state.b_value, key="blue")
    st.session_state.b_value = b_value
    st.markdown(f"<div style='background-color: rgb(0, 0, {b_value}); height: 30px; border-radius: 5px;'></div>", unsafe_allow_html=True)

# 混色結果の表示
rgb_color = f"rgb({r_value}, {g_value}, {b_value})"
hex_color = f"#{r_value:02X}{g_value:02X}{b_value:02X}"

st.subheader("混色結果")
col1, col2 = st.columns([1, 2])

with col1:
    st.markdown(f"<div style='background-color: {rgb_color}; height: 150px; border-radius: 10px; border: 2px solid #ccc;'></div>", unsafe_allow_html=True)

with col2:
    st.write("**数値表現:**")
    st.write(f"RGB値: ({r_value}, {g_value}, {b_value})")
    st.write(f"16進数: {hex_color}")
    
    st.write("**2進数表現:**")
    st.write(f"赤: {r_value:08b}")
    st.write(f"緑: {g_value:08b}")
    st.write(f"青: {b_value:08b}")
    
    # 色の明度計算
    brightness = (r_value + g_value + b_value) / (3 * 255) * 100
    st.write(f"**明度: {brightness:.1f}%**")
    
    # 色の特徴説明
    if r_value > 200 and g_value > 200 and b_value > 200:
        st.info("💡 明るい色です（白に近い）")
    elif r_value < 50 and g_value < 50 and b_value < 50:
        st.info("💡 暗い色です（黒に近い）")
    elif abs(r_value - g_value) < 30 and abs(g_value - b_value) < 30:
        st.info("💡 無彩色です（グレー系）")
    else:
        dominant = max(r_value, g_value, b_value)
        if dominant == r_value and r_value > max(g_value, b_value) + 50:
            st.info("💡 赤系の色です")
        elif dominant == g_value and g_value > max(r_value, b_value) + 50:
            st.info("💡 緑系の色です")
        elif dominant == b_value and b_value > max(r_value, g_value) + 50:
            st.info("💡 青系の色です")

# RGB色空間の3D可視化
st.subheader("RGB色空間の可視化")
fig_3d = go.Figure(data=go.Scatter3d(
    x=[r_value/255], 
    y=[g_value/255], 
    z=[b_value/255],
    mode='markers',
    marker=dict(
        size=20,
        color=[rgb_color],
        showscale=False
    ),
    text=[f"R:{r_value}, G:{g_value}, B:{b_value}"],
    hoverinfo='text',
    showlegend=False
))

# RGB立方体の枠線を追加
cube_lines = [
    # 底面
    ([0,1,1,0,0], [0,0,1,1,0], [0,0,0,0,0]),
    # 上面
    ([0,1,1,0,0], [0,0,1,1,0], [1,1,1,1,1]),
    # 縦線
    ([0,0], [0,0], [0,1]),
    ([1,1], [0,0], [0,1]),
    ([1,1], [1,1], [0,1]),
    ([0,0], [1,1], [0,1])
]

for x, y, z in cube_lines:
    fig_3d.add_trace(go.Scatter3d(
        x=x, y=y, z=z,
        mode='lines',
        line=dict(color='gray', width=2),
        showlegend=False,
        hoverinfo='none'
    ))

fig_3d.update_layout(
    scene=dict(
        xaxis_title='Red',
        yaxis_title='Green',
        zaxis_title='Blue',
        xaxis=dict(range=[0, 1]),
        yaxis=dict(range=[0, 1]),
        zaxis=dict(range=[0, 1])
    ),
    width=600,
    height=500,
    title="RGB色空間での色の位置"
)

st.plotly_chart(fig_3d, use_container_width=True)

# 特別な色の組み合わせ
st.subheader("特別な色の組み合わせ")
special_colors = {
    "赤": (255, 0, 0),
    "緑": (0, 255, 0),
    "青": (0, 0, 255),
    "黄色": (255, 255, 0),
    "マゼンタ": (255, 0, 255),
    "シアン": (0, 255, 255),
    "白": (255, 255, 255),
    "黒": (0, 0, 0)
}

selected_special = st.selectbox("特別な色を試してみる", list(special_colors.keys()))
if st.button("この色を適用"):
    r, g, b = special_colors[selected_special]
    st.session_state.r_value = r
    st.session_state.g_value = g
    st.session_state.b_value = b
    st.rerun()

# 色の組み合わせボタンをグリッド形式で表示
st.write("**クイックカラー選択:**")
color_cols = st.columns(4)
color_buttons = [
    ("🔴", "赤", (255, 0, 0)),
    ("🟢", "緑", (0, 255, 0)),
    ("🔵", "青", (0, 0, 255)),
    ("🟡", "黄色", (255, 255, 0)),
    ("🟣", "マゼンタ", (255, 0, 255)),
    ("🩵", "シアン", (0, 255, 255)),
    ("⚪", "白", (255, 255, 255)),
    ("⚫", "黒", (0, 0, 0))
]

for i, (emoji, name, (r, g, b)) in enumerate(color_buttons):
    with color_cols[i % 4]:
        if st.button(f"{emoji} {name}", key=f"quick_color_{name}"):
            st.session_state.r_value = r
            st.session_state.g_value = g
            st.session_state.b_value = b
            st.rerun()

st.divider()

# 3. まとめと関連情報
st.header("3. まとめと関連情報")

st.subheader("ラスタ形式 vs ベクタ形式")
comparison_data = {
    "項目": ["拡大時の品質", "ファイルサイズ", "適用例", "編集の柔軟性"],
    "ラスタ形式": ["ジャギーが発生", "大きくなりがち", "写真、複雑な画像", "ピクセル単位の細かい編集"],
    "ベクタ形式": ["常に滑らか", "小さい", "ロゴ、アイコン、図形", "オブジェクト単位の編集"]
}

for i, item in enumerate(comparison_data["項目"]):
    col1, col2, col3 = st.columns(3)
    with col1:
        if i == 0:
            st.write("**項目**")
        st.write(item)
    with col2:
        if i == 0:
            st.write("**ラスタ形式**")
        st.write(comparison_data["ラスタ形式"][i])
    with col3:
        if i == 0:
            st.write("**ベクタ形式**")
        st.write(comparison_data["ベクタ形式"][i])

st.subheader("加法混色（RGB）について")
st.write("""
**加法混色の特徴:**
- 光を混ぜ合わせる方式（ディスプレイで使用）
- 混色すると明るくなる
- 全ての色を最大値にすると白色になる
- 全ての色を最小値（0）にすると黒色になる

**デジタルでの色表現:**
- 各色成分を0-255の256段階で表現
- 合計で256³ = 16,777,216色を表現可能
- 16進数表記（#RRGGBB）でWebなどでよく使用される
- コンピュータ内部では2進数で処理される
""")

# インタラクティブな色相環
st.subheader("色相環で色の関係を理解する")
fig_hue = px.scatter_polar(
    r=[1] * 360,
    theta=list(range(360)),
    color=list(range(360)),
    color_continuous_scale='hsv',
    title="HSV色相環"
)
fig_hue.update_layout(showlegend=False, coloraxis_showscale=False)
fig_hue.update_traces(marker=dict(size=3))
st.plotly_chart(fig_hue, use_container_width=True)

st.info("""
💡 **発展学習のヒント:**
- 減法混色（CMY/CMYK）との違いを調べてみましょう
- HSV色空間について学んでみましょう
- 画像フォーマット（JPEG, PNG, SVG）の特徴を比較してみましょう
- 色覚特性について理解を深めてみましょう
""")