class IdCardValidatorApp {
    constructor() {
        this.initElements();
        this.bindEvents();
        console.log('App initialized'); // 调试日志
    }

    initElements() {
        this.inputArea = document.getElementById('inputArea');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.filterSelect = document.getElementById('filterSelect');
        this.resultList = document.getElementById('resultList');
        this.totalCount = document.getElementById('totalCount');
        this.validCount = document.getElementById('validCount');
        this.invalidCount = document.getElementById('invalidCount');
        this.inputLineNumbers = document.getElementById('inputLineNumbers');
        this.ageFilterType = document.getElementById('ageFilterType');
        this.ageFilterValue = document.getElementById('ageFilterValue');
        
        // 验证元素是否都找到
        console.log('Elements initialized:', {
            inputArea: this.inputArea,
            resultList: this.resultList,
            // ... 其他元素
        });
    }

    bindEvents() {
        // 使用箭头函数保持 this 上下文
        this.inputArea.addEventListener('input', () => this.handleInput());
        this.inputArea.addEventListener('paste', (e) => this.handlePaste(e));
        this.clearBtn.addEventListener('click', () => this.handleClear());
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.filterSelect.addEventListener('change', (e) => this.handleFilterChange(e));
        this.ageFilterType.addEventListener('change', () => this.handleAgeFilterChange());
        this.ageFilterValue.addEventListener('input', () => this.handleAgeFilterInput());
        
        console.log('Events bound');

        // 同步输入区域和行号的滚动
        this.inputArea.addEventListener('scroll', () => {
            this.inputLineNumbers.scrollTop = this.inputArea.scrollTop;
        });
    }

    handleInput() {
        console.log('Input event triggered');
        const text = this.inputArea.value;
        this.updateLineNumbers();
        this.processInput(text);
    }

    handlePaste(event) {
        console.log('Paste event triggered');
        event.preventDefault();
        const text = event.clipboardData.getData('text');
        this.inputArea.value = text;
        this.updateLineNumbers();
        this.processInput(text);
    }

    processInput(text) {
        console.log('Processing input:', text);
        const lines = text.split('\n').filter(line => line.trim());
        this.results = lines.map(line => {
            const result = idCardValidator.validate(line.trim());
            console.log('Validation result for line:', line, result);
            return result;
        });
        this.updateUI();
    }

    updateUI() {
        console.log('Updating UI with results:', this.results);
        this.renderResults();
        this.updateStats();
        this.downloadBtn.disabled = this.results.length === 0;
    }

    renderResults() {
        this.resultList.innerHTML = '';
        const filteredResults = this.filterResults();
        
        filteredResults.forEach((result, index) => {
            const div = document.createElement('div');
            div.className = `result-item ${result.isValid ? 'valid' : 'invalid'}`;
            
            let html = `
                <div class="line-number">${index + 1}</div>
                <div class="result-content">
                    <div class="id-number">${result.originalValue}</div>
                    ${result.isValid 
                        ? `<div class="details">省份：${result.province} | 出生日期：${result.birthday} | 性别：${result.gender} | 年龄：${result.age}岁</div>`
                        : `<div class="error">${result.error}</div>`
                    }
                </div>
            `;
            
            div.innerHTML = html;
            this.resultList.appendChild(div);
        });
    }

    handleClear() {
        this.inputArea.value = '';
        this.updateLineNumbers();
        this.results = [];
        this.updateUI();
    }

    handleFilterChange(event) {
        this.currentFilter = event.target.value;
        this.renderResults();
    }

    handleAgeFilterChange() {
        const filterType = this.ageFilterType.value;
        this.ageFilterValue.disabled = filterType === 'none';
        
        if (filterType === 'none') {
            this.ageFilterValue.value = ''; // 清空年龄输入值
            this.currentFilter = 'all';     // 重置为显示全部
            this.filterSelect.value = 'all'; // 重置筛选下拉框
        }
        
        this.renderResults();
        this.updateStats();
    }

    handleAgeFilterInput() {
        if (this.ageFilterValue.value) {
            this.renderResults();
        }
    }

    filterResults() {
        let results = this.results;

        // 先按有效性筛选
        switch (this.currentFilter) {
            case 'valid':
                results = results.filter(r => r.isValid);
                break;
            case 'invalid':
                results = results.filter(r => !r.isValid);
                break;
        }

        // 再按年龄筛选
        const filterType = this.ageFilterType.value;
        const filterValue = parseInt(this.ageFilterValue.value);

        if (filterType !== 'none' && !isNaN(filterValue)) {
            results = results.filter(r => {
                if (!r.isValid || !r.age) return false;
                switch (filterType) {
                    case 'gt': return r.age > filterValue;
                    case 'lt': return r.age < filterValue;
                    case 'eq': return r.age === filterValue;
                    default: return true;
                }
            });
        }

        return results;
    }

    updateStats() {
        const filteredResults = this.filterResults();
        const validResults = filteredResults.filter(r => r.isValid);
        
        this.totalCount.textContent = filteredResults.length;
        this.validCount.textContent = validResults.length;
        this.invalidCount.textContent = filteredResults.length - validResults.length;
    }

    handleDownload() {
        if (this.results.length === 0) return;

        const headers = ['身份证号码', '验证结果', '省份', '出生日期', '性别', '年龄', '错误信息'];
        const rows = [headers];

        this.results.forEach(result => {
            rows.push([
                result.originalValue,
                result.isValid ? '有效' : '无效',
                result.province || '',
                result.birthday || '',
                result.gender || '',
                result.age ? `${result.age}岁` : '',
                result.error || ''
            ]);
        });

        const csvContent = rows
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '身份证验证结果.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    updateLineNumbers() {
        const lines = this.inputArea.value.split('\n');
        this.inputLineNumbers.innerHTML = lines
            .map((_, i) => `<div>${i + 1}</div>`)
            .join('');
    }
}

// 确保 DOM 加载完成后再初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IdCardValidatorApp(); // 保存到全局变量方便调试
    console.log('App started');
});
