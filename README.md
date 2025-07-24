# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6548d533-c30b-42fb-96e7-b01b04ef4b1f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6548d533-c30b-42fb-96e7-b01b04ef4b1f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6548d533-c30b-42fb-96e7-b01b04ef4b1f) and click on Share -> Publish.

## 🚀 Deploy to Vercel

This project is also ready for deployment to Vercel. Follow these steps:

### 1. Prerequisites
- Fork or push this repository to GitHub
- Create a Vercel account at [vercel.com](https://vercel.com)
- Have your Supabase credentials ready

### 2. Deploy Steps

1. **Import Project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   Add these environment variables in Vercel:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy:**
   - Vercel will automatically detect it's a Vite project
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### 3. Supabase Configuration

Make sure your Supabase project has:
- All required tables (aparatur_desa, profil_desa, berita, galeri, etc.)
- Row Level Security (RLS) policies configured
- Storage buckets created (galeridesa, berita, etc.)
- User roles table and policies

### 4. Domain Configuration

After deployment:
- Add your Vercel domain to Supabase Auth settings
- Update CORS settings if needed
- Test all functionality in production

### 5. Build Optimization

The project includes:
- ✅ Vercel configuration (`vercel.json`)
- ✅ Environment variables setup
- ✅ SPA routing configuration
- ✅ Production build optimization

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
