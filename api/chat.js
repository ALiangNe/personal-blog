// Vercel Serverless Function for AI chat
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        // 发送请求到 Ollama 服务
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-r1:8b',
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Ollama service error');
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: '抱歉，AI 服务暂时不可用。请稍后再试。'
        });
    }
} 