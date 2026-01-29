# Store Receipt Architect 🧾

A professional, free, and easy-to-use receipt generator web application. Create custom retail receipts for your business with a modern Google-style interface.

![App Screenshot](meta.png)

## ✨ Features

- **Modern Dashboard UI**: Clean, responsive interface inspired by Google's Material Design 3.
- **Real-time Preview**: See your receipt update instantly as you type.
- **Customizable**:
  - Add store name and address.
  - Upload custom logos (with scaling).
  - Set specific dates and times.
  - Randomly generated Transaction Codes.
- **Item Management**: Add multiple items, prices, and tax rates.
- **History Tracking**: Automatically saves generated receipts to your browser's local storage. View, edit, or delete past receipts.
- **Multiple Export Formats**: Download your receipt as **PNG**, **JPG**, or **PDF**.
- **Toast Notifications**: Smooth visual feedback for all actions.

## 🛠️ Tech Stack

- **HTML5**: Semantic structure.
- **CSS3**: Vanilla CSS with CSS Variables for theming and Flexbox/Grid for layout.
- **JavaScript (ES6+)**: Vanilla JS for logic, state management, and DOM manipulation.
- **Libraries**:
  - [`html2canvas`](https://html2canvas.hertzen.com/): For capturing the receipt as an image.
  - [`jspdf`](https://github.com/parallax/jsPDF): For PDF generation.
  - [Phosphor Icons](https://phosphoricons.com/): For beautiful, consistent iconography.
  - [Google Fonts](https://fonts.google.com/): Using 'Geom' (custom), 'Google Sans', and 'Inter'.

## 🚀 Deployment

This project is static-site ready and perfect for **Netlify**.

### Deploy to Netlify
1. Fork or push this repo to your GitHub.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** -> **"Import from existing project"**.
4. Select **GitHub** and choose this repository.
5. Click **Deploy**. (No build command or output directory needed).

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/theezemmuo/Store-Receipt-Architect.git
   ```
2. Open `index.html` in your browser.
   - OR use a live server (VS Code Live Server extension recommended) for the best experience.

## 📄 License

This project is open source and available for personal and commercial use.

---

built with ❤️ by [TheEzemmuo](https://github.com/theezemmuo)
