/**
 * Huecos fijos del menú. No son referencias: solo ocupan su sitio en la cuadrícula
 * (como los huecos vacíos y el canal del disco del menú de consola) y son decorativos.
 */
export function DiscSlot() {
  return (
    <li className="wii-slot wii-slot--disc" aria-hidden>
      <div className="wii-cd">
        <span className="wii-cd__ring" />
        <span className="wii-cd__hole" />
      </div>
    </li>
  );
}

export function EmptySlot() {
  return <li className="wii-slot wii-slot--empty" aria-hidden />;
}
