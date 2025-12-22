export default function TShirtOutline({ color = '#ffffff', className = '' }: { color?: string, className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Actual T-Shirt Path */}
      <path
        fill={color}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1"
        d="M150,25 C170,25 180,60 256,60 C332,60 342,25 362,25 C390,25 430,45 450,90 L410,140 L390,130 L390,480 C390,500 122,500 122,480 L122,130 L102,140 L62,90 C82,45 122,25 150,25 Z"
      />
      
      {/* Collar Detail */}
      <path
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="2"
        d="M180,25 C180,25 190,55 256,55 C322,55 332,25 332,25"
      />
      
       {/* Sleeves Detail */}
       <path
        fill="none"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="2"
        d="M122,130 L102,140 M390,130 L410,140"
      />
    </svg>
  );
}
