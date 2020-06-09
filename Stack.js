class Stack {
    constructor() {
        this.data = []
        this.peek = 0
    }

    isEmpty() {
        return this.peek === 0
    }

    push(element) {
        this.data[this.peek] = element
        this.peek += 1
    }

    pop() {
        if (this.isEmpty() === false) {
            this.peek -= 1
            return this.data.pop()
        }
    }

    top() {
        return this.data[this.peek - 1]
    }
}

function isOperand(char) {
    return !isNaN(char)
}

function isOperator(char) {
    switch (char) {
        case '+': return true
        case '-': return true
        case '*': return true
        case '%': return true
        case '/': return true
        case '(': return true
    }
    return false
}

function inPrec(char) {
    switch(char) {
        case '+': 
        case '-': 
            return 2
        case '*': 
        case '%': 
        case '/': 
            return 4
        case '(': 
            return 0
    }
}

function outPrec(char) {
    switch(char) {
        case '+': 
        case '-': 
            return 1
        case '*': 
        case '%': 
        case '/': 
            return 3
        case '(': 
            return 100
    }
}

function inToPost(input) {
    let stack = new Stack()
    let postfix = []
    for (let i = 0; i < input.length; i++) {
        if (isOperand(input[i])) {
            postfix.push(input[i])
        } else if (isOperator(input[i])) {
            if (stack.isEmpty() || outPrec(input[i]) > inPrec(stack.top())) {
                stack.push(input[i])
            } else {
                while (!stack.isEmpty() && outPrec(input[i]) < inPrec(stack.top())) {
                    postfix.push(stack.top())
                    stack.pop()
                }
                stack.push(input[i])
            }
            
        } else if (input[i] === ')') {
            while (stack.top() != '(') {
                postfix.push(stack.top())
                stack.pop()

                if (stack.isEmpty()) {
                    console.log('Wrong input')
                    return
                }
            }

            stack.pop()
        }
    }

    while (!stack.isEmpty()) {
        if (stack.top() === '(') {
            console.log('Wrong input')
            return
        }
        postfix.push(stack.top())
        stack.pop()
    }
    return postfix
}

function evaluatePostfix(exp) {
    let stack = new Stack()
    for (let i = 0; i < exp.length; i++) {
    console.log(stack.data)
        if (isOperand(exp[i])) {
            // + converts, string into an integer type
            console.log(exp[i])
            console.log(isOperand(exp[i]))
            stack.push(+exp[i])
        }
        else {
            const valOne = stack.pop()
            const valTwo = stack.pop()

            switch(exp[i]) {
                case '+': 
                    stack.push(valTwo + valOne)
                    break
                case '-':
                    stack.push(valTwo - valOne)
                    break
                case '*':
                    stack.push(valTwo * valOne)
                    break
                case '/':
                    stack.push(valTwo / valOne)
            }
        }
    }
    return stack.pop()
}

function spaceSeparator(string) {
    return string.split(/([-()+*/])/g)
}


module.exports = {
    Stack,
    inToPost,
    outPrec,
    inPrec,
    isOperator,
    isOperand,
    spaceSeparator,
    evaluatePostfix
}
