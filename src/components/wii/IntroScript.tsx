/**
 * Script mínimo que se ejecuta antes de pintar: decide si toca mostrar la intro
 * (solo al aterrizar en "/" en una sesión nueva). Sin datos de usuario ni secretos.
 */
const code = `try{var d=document.documentElement;d.dataset.intro=(location.pathname==="/"&&!sessionStorage.getItem("atw_intro_seen"))?"active":"seen"}catch(e){}`;

export function IntroScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
