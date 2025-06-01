<template>
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-links">
          <a href="#" class="footer-link">О нас</a>
          <a href="#" class="footer-link">Контакты</a>
          <a href="#" class="footer-link">Политика конфиденциальности</a>
        </div>
        <p class="footer-copyright">© 2025 Movie Searcher. Все права защищены.</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'SiteFooter',
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #f8f8f8;
    padding: 20px 0;
    font-family: 'Montserrat', sans-serif;
  }
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }
  
  .footer-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 10px;
  }
  
  .footer-link {
    font-size: 14px;
    color: #333;
    text-decoration: none;
  }
  
  .footer-link:hover {
    color: #007bff;
  }
  
  .footer-copyright {
    font-size: 13px;
    color: #666;
  }
  
  @media (max-width: 600px) {
    .footer-links {
      flex-direction: column;
      gap: 10px;
    }
  
    .footer-link {
      font-size: 13px;
    }
  
    .footer-copyright {
      font-size: 12px;
    }
  }
  </style>