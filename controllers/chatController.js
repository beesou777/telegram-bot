const generativeAIService = require('../services/generativeAIService');
const { marked } = require('marked');
const { htmlToText } = require('html-to-text');

function convertMarkdownToText(markdownContent) {
    const html = marked(markdownContent); 
    const text = htmlToText(html);
    return text;
}

const generateContent = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const newPrompt = `${prompt}\nAssistant:`;

        const result = await generativeAIService.generateContent(newPrompt);

        if (result && result.response.text()) {
            let markdownContent = result.response.text();
            const data = convertMarkdownToText(markdownContent);
            res.json({ data });
        } else {
            res.status(500).json({ error: 'Unexpected result structure' });
        }

    } catch (error) {
        let errorMessage = 'Error generating content';
        if (error.message.includes('SAFETY')) {
            errorMessage = 'The prompt might have violated safety guidelines. Please try rephrasing it.';
        }
        res.status(500).json({ error: errorMessage, details: error.message });
    }
};

module.exports = {
    generateContent
};
