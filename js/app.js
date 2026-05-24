// Configuración: reemplazá FORM_ENDPOINT por tu endpoint de Formspree (https://formspree.io/f/XXXXX)
// O configurá EmailJS arriba en index.html y ajustá USE_EMAILJS a true con tus IDs.
const CONFIG = {
	FORM_ENDPOINT: 'https://formspree.io/f/REPLACE_WITH_YOUR_ID',
	USE_EMAILJS: false,
	EMAILJS_SERVICE_ID: 'YOUR_SERVICE_ID',
	EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
	EMAILJS_USER_ID: 'REPLACE_WITH_EMAILJS_USER_ID'
};

document.addEventListener('DOMContentLoaded', () => {
	// Año en el footer
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const form = document.getElementById('contactForm');
	const status = document.getElementById('formStatus');
	const submitBtn = document.getElementById('submitBtn');

	if (!form) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		status.hidden = true;

		// Validación simple
		if (!form.checkValidity()){
			form.reportValidity();
			return;
		}

		submitBtn.disabled = true;
		submitBtn.setAttribute('aria-busy','true');

		try{
			// Recolectar datos
			const formData = new FormData(form);

			// Si hay archivo, FormData lo contiene y Formspree lo acepta
			if (CONFIG.USE_EMAILJS && window.emailjs){
				// Preparar params para EmailJS (no incluye archivos por defecto)
				const params = {};
				formData.forEach((v,k)=>{ if (v instanceof File) return; params[k]=v; });
				await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, params, CONFIG.EMAILJS_USER_ID);
			} else if (CONFIG.FORM_ENDPOINT && CONFIG.FORM_ENDPOINT.includes('formspree.io')){
				const res = await fetch(CONFIG.FORM_ENDPOINT, {method:'POST', body:formData, headers:{'Accept':'application/json'}});
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || 'Error al enviar el formulario');
			} else {
				throw new Error('No hay endpoint de envío configurado. Editá js/app.js y poné tu FORM_ENDPOINT o activá EmailJS.');
			}

			status.hidden = false;
			status.className = 'form-status success';
			status.textContent = 'Consulta enviada correctamente. Te responderemos por email.';
			form.reset();
		}catch(err){
			console.error(err);
			status.hidden = false;
			status.className = 'form-status error';
			status.textContent = 'Hubo un error al enviar: ' + (err.message || err);
		}finally{
			submitBtn.disabled = false;
			submitBtn.removeAttribute('aria-busy');
		}
	});
});

