-- Create knowledge_graphs table
CREATE TABLE IF NOT EXISTS public.knowledge_graphs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    folder_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    node_count INTEGER DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    graph_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_graphs_user_id ON public.knowledge_graphs(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_graphs_status ON public.knowledge_graphs(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_graphs_created_at ON public.knowledge_graphs(created_at);

-- Enable RLS
ALTER TABLE public.knowledge_graphs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own knowledge graphs" ON public.knowledge_graphs;
DROP POLICY IF EXISTS "Users can create their own knowledge graphs" ON public.knowledge_graphs;
DROP POLICY IF EXISTS "Users can update their own knowledge graphs" ON public.knowledge_graphs;
DROP POLICY IF EXISTS "Users can delete their own knowledge graphs" ON public.knowledge_graphs;

-- Create RLS policies
CREATE POLICY "Users can view their own knowledge graphs" ON public.knowledge_graphs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge graphs" ON public.knowledge_graphs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge graphs" ON public.knowledge_graphs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge graphs" ON public.knowledge_graphs
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_knowledge_graphs_updated_at ON public.knowledge_graphs;

-- Create the trigger
CREATE TRIGGER update_knowledge_graphs_updated_at 
    BEFORE UPDATE ON public.knowledge_graphs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
