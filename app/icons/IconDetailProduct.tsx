interface IconProps {
  className?: string;
  fill?: string;
}

function IconHeartFull({ className, fill }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 25 24" fill="none">
      <g clipPath="url(#clip0_5327_16276)">
        <path
          d="M3.98739 4.79293C6.24308 2.53724 9.85937 2.47139 12.1945 4.59539C14.5296 2.47139 18.1459 2.53724 20.4016 4.79293C22.7251 7.11645 22.7251 10.8836 20.4016 13.2071L12.9016 20.7071C12.5111 21.0977 11.8779 21.0977 11.4874 20.7071L3.98739 13.2071C1.66387 10.8836 1.66387 7.11645 3.98739 4.79293Z"
          fill="#EE4037"
        />
      </g>
      <defs>
        <clipPath id="clip0_5327_16276">
          <rect width={20} height={20} fill="white" transform="translate(2.19452 2)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function IconHeartEmpty({ className, fill }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <g clipPath="url(#clip0_4628_8807)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.3905 8.27616C12.3339 6.21953 8.99941 6.21952 6.94278 8.27615C4.88615 10.3328 4.88615 13.6672 6.94278 15.7239L16 24.7811L25.0572 15.7239C27.1138 13.6672 27.1138 10.3328 25.0572 8.27615C23.0005 6.21952 19.6661 6.21953 17.6094 8.27616L16.9428 8.94282C16.4221 9.46352 15.5779 9.46352 15.0572 8.94282L14.3905 8.27616ZM16 6.12714C12.8865 3.29515 8.06475 3.38295 5.05716 6.39054C1.95914 9.48856 1.95914 14.5115 5.05716 17.6095L15.0572 27.6095C15.5779 28.1302 16.4221 28.1302 16.9428 27.6095L26.9428 17.6095C30.0408 14.5115 30.0408 9.48856 26.9428 6.39054C23.9352 3.38295 19.1135 3.29515 16 6.12714Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_4628_8807">
          <rect
            width="26.6667"
            height="26.6667"
            fill="white"
            transform="translate(2.66663 2.66663)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export { IconHeartFull, IconHeartEmpty };
