import './style.scss';
import { ext, storage, manifest } from '../helpers';
import './picker';

(async () => {
    // messages from background
	ext.onMessage(payload => {
        console.log('content', payload);
	});

    // notify background
    ext.sendMessage({ command: 'hello-from-content-script', data: {
        color: 'tomato',
    }});

    /*
        simple example
        • get stored background color
        • set background color using color picker (google input)
        • store background color
    */
    const input = document.querySelector('input');
    const rgbaString = await storage.get('color');

    new Picker({
        parent: input.parentElement,
        color: rgbaString || 'gold',
        popup: 'top',
        onChange: function(color) {
            document.body.style.background = color.rgbaString;
        },
        onClose: function(color) {
            storage.set({ color: color.rgbaString });
        }        
    });      
    
    // made available via manifest.web_accessible_resources
    input.insertAdjacentHTML(
        'beforebegin', 
        `<img src="${manifest.resource('/icon.png')}">`
    )
})();
