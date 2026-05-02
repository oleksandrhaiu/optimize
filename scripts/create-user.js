import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Parse .env manually to avoid adding dotenv dependency
let SUPABASE_URL = '';
let SUPABASE_SECRET_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SECRET_KEY = line.split('=')[1].trim();
  });
}

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Ошибка: В файле .env должны быть VITE_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function createUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const username = process.argv[4];

  if (!email || !password || !username) {
    console.log('⚠️ Использование: npm run add-user <email> <пароль> <юзернейм>');
    console.log('Пример: npm run add-user test@mail.com 123456 yarik2');
    process.exit(1);
  }

  console.log(`⏳ Создание пользователя ${email}...`);

  // 1. Создаем пользователя через Admin API (обходит любые лимиты!)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Автоматически подтверждаем email
  });

  if (authError) {
    console.error('❌ Ошибка создания аккаунта:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  // 2. Добавляем данные в таблицу профилей
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    email,
    username,
    avatar_color: '#4B9EFF'
  });

  if (profileError) {
    console.error('❌ Ошибка добавления профиля (возможно такой юзернейм уже занят):', profileError.message);
    // Откат: удаляем юзера из auth, если профиль не создался
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log(`✅ Успех! Пользователь @${username} успешно создан.`);
  console.log('Теперь вы можете зайти в приложение на страницу Login (Вход) и ввести эти данные.');
}

createUser();
