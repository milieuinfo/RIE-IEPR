document.addEventListener("DOMContentLoaded", function() {
  if (window.mermaid) {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'forest',
      themeVariables: {
        primaryColor: '#007A87',
        primaryTextColor: '#fff',
        primaryBorderColor: '#005f6a',
        lineColor: '#007A87',
        secondaryColor: '#e6f4f5',
        tertiaryColor: '#b2e0e3'
      }
    });
  }
});
