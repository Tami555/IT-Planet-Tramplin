import React from 'react';
import { Heart, Github, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-grid">
          {/* Лого и описание */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🚀</span>
              <span className="logo-text">Трамплин</span>
            </div>
            <p className="footer-description">
              Платформа для объединения талантливых студентов, 
              выпускников и IT-компаний. Строим карьеру с нуля вместе!
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.6-1.38-.97-2.23-1.56-.99-.69-.35-1.07.22-1.69.15-.15 2.78-2.55 2.83-2.77.01-.03.01-.12-.06-.17-.07-.05-.17-.03-.24-.02-.1.02-1.68 1.07-4.75 3.14-.45.31-.86.46-1.22.45-.4-.01-1.17-.23-1.74-.41-.71-.23-1.28-.35-1.23-.74.03-.2.3-.41.82-.63 3.21-1.4 5.35-2.32 6.43-2.76 3.06-1.25 3.69-1.47 4.11-1.48.09 0 .3.02.44.13.11.09.15.21.16.33-.01.06.01.14-.02.23z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="VK">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.85 14.5h-1.2c-.5 0-.8-.2-1.1-.6-.6-.8-1.3-1.4-1.8-1.4-.5 0-.7.2-.7.8v1.2c0 .3-.2.4-.6.4h-1.5c-.4 0-.6-.2-.6-.6v-4.9c0-.4.2-.6.6-.6h1.5c.4 0 .6.2.6.6v1.1c0 .4.2.6.6.6.4 0 .9-.3 1.3-.7.7-.7 1.1-1.5 1.1-2.4 0-.4-.2-.6-.6-.6h-1.6c-.4 0-.6.2-.6.6v2.5c0 .4-.2.6-.6.6h-1.5c-.4 0-.6-.2-.6-.6v-3.1c0-.4.2-.6.6-.6h4.6c.4 0 .6.2.6.6v.9c0 1.1-.5 2.1-1.3 2.8-.2.2-.3.4-.2.6.1.2.3.3.5.4.6.3 1.1.8 1.5 1.3.4.5.6 1.1.6 1.8 0 .4-.2.6-.6.6z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div className="footer-section">
            <h4 className="footer-title">Навигация</h4>
            <ul className="footer-links">
              <li><a href="/">Главная</a></li>
              <li><a href="/favorites">Избранное</a></li>
              <li><a href="/companies">Компании</a></li>
              <li><a href="/about">О проекте</a></li>
            </ul>
          </div>

          {/* Для соискателей */}
          <div className="footer-section">
            <h4 className="footer-title">Соискателям</h4>
            <ul className="footer-links">
              <li><a href="#">Как найти стажировку</a></li>
              <li><a href="#">Менторские программы</a></li>
              <li><a href="#">Карьерные мероприятия</a></li>
              <li><a href="#">Советы по резюме</a></li>
            </ul>
          </div>

          {/* Для работодателей */}
          <div className="footer-section">
            <h4 className="footer-title">Работодателям</h4>
            <ul className="footer-links">
              <li><a href="#">Разместить вакансию</a></li>
              <li><a href="#">Провести мероприятие</a></li>
              <li><a href="#">Стать ментором</a></li>
              <li><a href="#">Реклама на платформе</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h4 className="footer-title">Контакты</h4>
            <ul className="footer-contacts">
              <li>
                <Mail size={16} />
                <a href="mailto:info@tramplin.ru">info@tramplin.ru</a>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+74997033949">+7 (499) 703-39-49</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Москва, ул. Льва Толстого, 16</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 Трамплин. Все права защищены.
          </div>
          <div className="footer-made">
            Сделано с <Heart size={14} fill="currentColor" /> для IT-Планета 2026
          </div>
          <button className="scroll-top" onClick={scrollToTop}>
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;