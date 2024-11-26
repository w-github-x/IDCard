class IdCardValidator {
    constructor() {
        this.weightFactors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        this.checkCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    }

    getGender(idCard) {
        // 提取性别位（第17位）
        const genderCode = parseInt(idCard.charAt(16));
        return genderCode % 2 === 0 ? '女' : '男';
    }

    calculateAge(birthday) {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    validate(idCard) {
        const result = {
            isValid: false,
            originalValue: idCard,
            province: '',
            birthday: '',
            gender: '',
            age: '',
            error: '',
            expectedCode: ''
        };

        // 基础格式检查
        if (!idCard) {
            result.error = '身份证号码不能为空';
            return result;
        }

        // 提取身份证号码
        const matches = idCard.replace(/\s+/g, '').match(/[0-9xX]{17,18}/);
        if (!matches) {
            result.error = '未找到有效的身份证号码';
            return result;
        }

        idCard = matches[0].toUpperCase();
        
        if (!/^\d{17}[\dX]$/.test(idCard)) {
            result.error = '身份证号码格式不正确';
            return result;
        }

        // 省份验证
        const provinceCode = idCard.substring(0, 2);
        if (!areaCodeMap[provinceCode]) {
            result.error = '省份代码不正确';
            return result;
        }
        result.province = areaCodeMap[provinceCode];

        // 出生日期验证
        const year = parseInt(idCard.substring(6, 10));
        const month = parseInt(idCard.substring(10, 12));
        const day = parseInt(idCard.substring(12, 14));

        if (!this.isValidDate(year, month, day)) {
            result.error = '出生日期不正确';
            return result;
        }
        const birthDate = new Date(year, month - 1, day);
        result.age = this.calculateAge(birthDate);
        result.birthday = `${year}年${month}月${day}日`;

        // 性别判断
        result.gender = this.getGender(idCard);

        // 校验码验证
        const checkCode = idCard.charAt(17);
        const calculatedCode = this.calculateCheckCode(idCard);
        
        if (checkCode !== calculatedCode) {
            result.error = `校验码不正确，应为：${calculatedCode}`;
            result.expectedCode = calculatedCode;
            return result;
        }

        result.isValid = true;
        return result;
    }

    isValidDate(year, month, day) {
        const date = new Date(year, month - 1, day);
        const currentYear = new Date().getFullYear();
        
        return date.getFullYear() === year &&
               date.getMonth() === month - 1 &&
               date.getDate() === day &&
               year >= 1900 &&
               year <= currentYear;
    }

    calculateCheckCode(idCard) {
        let sum = 0;
        for (let i = 0; i < 17; i++) {
            sum += parseInt(idCard.charAt(i)) * this.weightFactors[i];
        }
        return this.checkCodeMap[sum % 11];
    }
}

// 创建验证器实例
const idCardValidator = new IdCardValidator();
