// 检查运行模式
document.addEventListener('DOMContentLoaded', function() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const runMode = document.getElementById('runMode');
    const modeDescription = document.getElementById('modeDescription');

    if (isLocalhost) {
        runMode.textContent = '本地模式';
        modeDescription.textContent = '在本地模式下，您可以使用所有功能，包括 AI 对话。试着问我一些问题吧！';
    } else {
        runMode.textContent = '在线模式';
        modeDescription.innerHTML = '您可以直接使用 AI 对话功能，但需要确保：<br>' +
            '1. 您的电脑上已安装并运行 Ollama<br>' +
            '2. 已下载 Deepseek 模型（deepseek-r1:8b）<br>' +
            '如果遇到问题，请确保 Ollama 服务正在运行。';
    }

    // 轮播图功能
    const carousel = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentIndex = 0;
    const totalItems = items.length;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    // 添加事件监听器
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // 自动轮播
    setInterval(nextSlide, 5000);

    // AI对话框功能
    const messages = document.getElementById('messages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');

    // 设置输入区域状态
    if (!isLocalhost) {
        userInput.placeholder = '请在本地环境运行以使用 AI 对话功能';
        userInput.disabled = true;
        sendButton.disabled = true;
        sendButton.style.opacity = '0.5';
    }

    // 添加消息到对话框
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="avatar">${isUser ? '你' : 'AI'}</div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // 添加加载动画
    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.innerHTML = `
            <div class="avatar">AI</div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messages.appendChild(indicator);
        messages.scrollTop = messages.scrollHeight;
        return indicator;
    }

    /**
     * 知识库管理功能
     * 这部分代码负责处理知识库的所有交互功能，包括：
     * 1. 显示/隐藏知识库面板
     * 2. 添加新知识
     * 3. 保存知识到本地存储
     * 4. 显示知识列表
     * 5. 删除知识
     */

    // ====== DOM元素获取 ======
    // 知识库开关按钮：控制知识库面板的显示和隐藏
    const toggleKnowledge = document.getElementById('toggleKnowledge');
    
    // 知识库主面板：包含所有知识库相关的内容
    const knowledgePanel = document.getElementById('knowledgePanel');
    
    // "添加知识"按钮：点击显示添加知识的表单
    const addKnowledge = document.getElementById('addKnowledge');
    
    // 添加知识的表单容器：包含标题和内容输入框
    const knowledgeForm = document.getElementById('knowledgeForm');
    
    // 知识内容输入框：用于输入详细的知识内容
    const knowledgeInput = document.getElementById('knowledgeInput');
    
    // 知识标题输入框：用于输入知识的标题
    const knowledgeTitle = document.getElementById('knowledgeTitle');
    
    // 保存按钮：点击将新知识保存到知识库
    const saveKnowledge = document.getElementById('saveKnowledge');
    
    // 取消按钮：点击关闭添加知识表单
    const cancelKnowledge = document.getElementById('cancelKnowledge');
    
    // 知识列表容器：显示所有已添加的知识
    const knowledgeList = document.getElementById('knowledgeList');

    // ====== 知识库数据管理 ======
    /**
     * 知识库数组：存储所有知识条目
     * 从localStorage读取已存储的知识库数据
     * 如果没有数据则初始化为空数组
     */
    let knowledgeBase = JSON.parse(localStorage.getItem('knowledgeBase')) || [];

    // ====== 事件监听器 ======
    /**
     * 知识库面板显示/隐藏控制
     * 点击toggleKnowledge按钮时触发
     */
    toggleKnowledge.addEventListener('click', () => {
        // 切换面板的显示状态
        knowledgePanel.classList.toggle('active');
        // 重新渲染知识列表
        renderKnowledgeList();
    });

    /**
     * 显示添加知识表单
     * 点击"添加知识"按钮时触发
     */
    addKnowledge.addEventListener('click', () => {
        // 显示表单
        knowledgeForm.classList.add('active');
        // 将焦点设置到输入框
        knowledgeInput.focus();
    });

    /**
     * 取消添加知识
     * 点击"取消"按钮时触发
     */
    cancelKnowledge.addEventListener('click', () => {
        // 隐藏表单
        knowledgeForm.classList.remove('active');
        // 清空输入框
        knowledgeInput.value = '';
        knowledgeTitle.value = '';
    });

    /**
     * 保存新知识
     * 点击"保存"按钮时触发
     */
    saveKnowledge.addEventListener('click', () => {
        // 获取并清理输入的内容
        const content = knowledgeInput.value.trim();
        const title = knowledgeTitle.value.trim();
        
        // 确保标题和内容都不为空
        if (content && title) {
            // 创建新的知识对象
            const knowledge = {
                id: Date.now(),          // 使用时间戳作为唯一ID
                title,                   // 知识标题
                content,                 // 知识内容
                timestamp: new Date().toISOString()  // 创建时间
            };
            
            // 添加到知识库数组
            knowledgeBase.push(knowledge);
            // 将知识库保存到localStorage
            localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
            
            // 清空表单
            knowledgeForm.classList.remove('active');
            knowledgeInput.value = '';
            knowledgeTitle.value = '';
            // 更新知识列表显示
            renderKnowledgeList();
        }
    });

    /**
     * 渲染知识列表
     * 将知识库中的所有知识显示到页面上
     */
    function renderKnowledgeList() {
        knowledgeList.innerHTML = knowledgeBase.map(item => `
            <div class="knowledge-item" data-id="${item.id}">
                <div class="knowledge-item-header">
                    <span class="knowledge-item-title">${item.title}</span>
                    <div class="knowledge-item-actions">
                        <button onclick="deleteKnowledge(${item.id})" class="action-button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p>${item.content}</p>
            </div>
        `).join('');
    }

    // 初始渲染知识列表
    renderKnowledgeList();

    // 将deleteKnowledge函数暴露为全局函数以便内联onclick调用
    window.deleteKnowledge = function(id) {
        // 从知识库中过滤掉要删除的知识
        knowledgeBase = knowledgeBase.filter(item => item.id !== id);
        // 更新localStorage中的数据
        localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
        // 重新渲染知识列表
        renderKnowledgeList();
    };

    // 发送消息到本地Deepseek服务
    async function sendToOllama(message) {
        try {
            // 构建包含知识库内容的提示
            let prompt = "基于以下知识回答问题：\n\n";
            knowledgeBase.forEach(item => {
                prompt += `${item.title}:\n${item.content}\n\n`;
            });
            prompt += `问题: ${message}\n回答:`;

            // 首先尝试使用8b模型
            try {
                const response8b = await fetch('http://localhost:11434/api/generate', {
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

                if (response8b.ok) {
                    const data = await response8b.json();
                    return data.response;
                }
            } catch (error8b) {
                console.log('8b模型不可用，尝试使用7b模型');
            }

            // 如果8b不可用，尝试使用7b模型
            const response7b = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:7b',
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response7b.ok) {
                throw new Error('两个模型都不可用');
            }

            const data = await response7b.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return '抱歉，我暂时无法回答。请确保您的电脑上已启动 Deepseek 服务。\n\n' +
                   '请检查：\n' +
                   '1. 是否已安装 Ollama\n' +
                   '2. 是否已下载 deepseek-r1:8b 或 deepseek-r1:7b 模型\n' +
                   '3. Ollama 服务是否正在运行';
        }
    }

    // 处理发送消息
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, true);
        userInput.value = '';

        // 添加加载动画
        const loadingIndicator = addTypingIndicator();

        try {
            // 获取AI响应
            const response = await sendToOllama(message);
            // 添加AI响应
            addMessage(response);
        } catch (error) {
            addMessage('抱歉，发生了错误。请确保您的电脑上已启动 Ollama 服务。');
        } finally {
            // 移除加载动画
            loadingIndicator.remove();
        }
    }

    // 发送按钮点击事件
    sendButton.addEventListener('click', handleSend);

    // 输入框回车发送
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // 文件上传功能
    const uploadFile = document.getElementById('uploadFile');
    const fileUploadForm = document.getElementById('fileUploadForm');
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    // 切换文件上传表单显示
    uploadFile.addEventListener('click', () => {
        fileUploadForm.classList.toggle('active');
        knowledgeForm.classList.remove('active');
    });

    // 文件拖放功能
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('drag-over');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('drag-over');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileDropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // 处理文件上传
    async function handleFiles(files) {
        for (const file of files) {
            if (validateFile(file)) {
                await processFile(file);
            }
        }
    }

    // 验证文件
    function validateFile(file) {
        const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('不支持的文件格式！');
            return false;
        }
        return true;
    }

    // 处理文件并提取文本
    async function processFile(file) {
        const fileItem = createFileListItem(file);
        fileList.appendChild(fileItem);

        try {
            const text = await extractTextFromFile(file);
            const knowledge = {
                id: Date.now(),
                title: `文件：${file.name}`,
                content: text,
                timestamp: new Date().toISOString()
            };

            knowledgeBase.push(knowledge);
            localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
            renderKnowledgeList();

            updateFileStatus(fileItem, 'success', '处理完成');
        } catch (error) {
            console.error('Error processing file:', error);
            updateFileStatus(fileItem, 'error', '处理失败');
        }
    }

    // 创建文件列表项
    function createFileListItem(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <div class="file-item-info">
                <span class="file-item-name">${file.name}</span>
                <span class="file-item-size">${formatFileSize(file.size)}</span>
            </div>
            <div class="file-item-status">处理中...</div>
            <div class="progress-bar">
                <div class="progress-bar-fill"></div>
            </div>
        `;
        return div;
    }

    // 更新文件状态
    function updateFileStatus(fileItem, status, message) {
        const statusElement = fileItem.querySelector('.file-item-status');
        statusElement.textContent = message;
        statusElement.className = `file-item-status ${status}`;
        const progressBar = fileItem.querySelector('.progress-bar-fill');
        progressBar.style.width = '100%';
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 提取文件文本内容
    async function extractTextFromFile(file) {
        if (file.type === 'text/plain') {
            return await file.text();
        } else if (file.type === 'application/pdf') {
            // 这里需要添加PDF解析库，比如pdf.js
            return '暂不支持PDF解析';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // 这里需要添加DOCX解析库，比如mammoth.js
            return '暂不支持DOCX解析';
        }
        return '';
    }
}); 