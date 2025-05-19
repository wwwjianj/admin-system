import OpenAI from "openai";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: 'sk-4275960083fc4b94885b8ce91514fbe5',
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);



async function main() {
    const response = await openai.chat.completions.create({
        model: "qwen-vl-max", // 此处以qwen-vl-max为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [{role: "user",content: [
            { type: "text", text: "这是什么？" },
            { type: "image_url",image_url: {"url": "https://wwww1235.oss-cn-nanjing.aliyuncs.com/uploads/1744548924489-js%C3%A4%C2%BA%C2%8B%C3%A4%C2%BB%C2%B6%C3%A5%C2%BE%C2%AA%C3%A7%C2%8E%C2%AF.png"}}
        ]}],
        stream: true,
    });
    for await (const chunk of response) {
        console.log(JSON.stringify(chunk));
    }
}


main();



// main();

