# 🎣 Fishing Annotation App

## 🚀 概要
釣り動画のアノテーションを行うために開発したアプリケーションです．
動画をアップロードし，3つの釣り動作のボタンを押すとタイムスタンプが記録される仕組みです．
<img width="1454" alt="スクリーンショット 2025-02-20 15 54 15" src="https://github.com/user-attachments/assets/7ab94e21-67ce-41d2-8b38-8db505552fb6" />
## 🛠 使用技術

### フロントエンド

- Next.js
- React

### バックエンド

- Flask
- Flask-CORS

### その他

- Python
- JavaScript

### フロントエンド

- Next.js
- React

### バックエンド

- Flask
- Flask-CORS

### その他

- Python
- JavaScript

## 📂 プロジェクト構成

```
Fishing_Annotation_App/
├── frontend/   # フロントエンド (Next.js)
├── backend/    # バックエンド (Flask)
│   ├── app.py  # Flask API
│   ├── requirements.txt  # バックエンドの依存関係
```

## 🔧 セットアップ方法

### 1. フロントエンドのセットアップ (Next.js)

```sh
cd frontend/video-annotation-app
npm install
npm run dev
```

**アプリが ****[http://localhost:3000](http://localhost:3000)**** で起動します**

### 2. バックエンドのセットアップ (Flask)

```sh
cd backend
python -m venv venv
source venv/bin/activate  # Windows の場合: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**APIサーバーが ****[http://localhost:5001](http://localhost:5001)**** で起動します**

## 🌍 API エンドポイント

| メソッド | エンドポイント         | 説明              |
| ---- | --------------- | --------------- |
| POST | `/get_metadata` | 動画ファイルのメタデータを取得 |

## 📝 備考

