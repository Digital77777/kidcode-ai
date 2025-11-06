import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createApprovalRequest, logActivity, updateProgress } from "@/components/ActivityTracker";

const templates = {
  "1": {
    title: "AI Art Generator",
    description: "Create amazing artwork with AI",
    color: "from-pink-500 to-purple-500",
  },
  "2": {
    title: "Story Bot",
    description: "Build an AI that writes stories",
    color: "from-blue-500 to-cyan-500",
  },
};

export default function LabEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("My Project");
  const [publishing, setPublishing] = useState(false);

  const template = templates[id as keyof typeof templates];

  if (!template) {
    navigate("/lab");
    return null;
  }

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Create approval request
      const request = await createApprovalRequest("publish_project", {
        project_name: projectName,
        template_id: id,
        template_name: template.title,
      });

      if (request) {
        // Log activity
        await logActivity("project_created", {
          template_id: id,
          project_name: projectName,
        });

        // Update progress
        await updateProgress({
          xp: 100,
          projects_completed: 1,
        });

        toast({
          title: "Request sent!",
          description: "Your project is awaiting parent approval to be published.",
        });

        navigate("/home");
      } else {
        toast({
          title: "Published!",
          description: "Your project is now live in the community.",
        });
        navigate("/community");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish project",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link to="/lab">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Lab
          </Button>
        </Link>

        <div className="playful-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Save className="mr-2 w-4 h-4" /> Save
              </Button>
              <Button variant="playful" onClick={handlePublish} disabled={publishing}>
                <Share2 className="mr-2 w-4 h-4" /> {publishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blocks Panel */}
          <div className="playful-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Building Blocks
            </h2>
            <div className="space-y-2">
              <div className="p-4 bg-muted/50 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="font-semibold mb-1">Input Block</div>
                <div className="text-sm text-muted-foreground">Get text or image input from users</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="font-semibold mb-1">AI Process Block</div>
                <div className="text-sm text-muted-foreground">Process data with AI</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="font-semibold mb-1">Output Block</div>
                <div className="text-sm text-muted-foreground">Display results to users</div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="playful-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Preview</h2>
              <Button size="sm" variant="outline">
                <Play className="mr-2 w-4 h-4" /> Test Run
              </Button>
            </div>
            <div className={`w-full h-96 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center`}>
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-xl font-bold">Your AI Creation</div>
                <div className="text-sm opacity-80">Add blocks to see your project come to life!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="playful-card mt-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30">
          <h3 className="font-bold text-lg mb-2">💡 How to Build</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Drag blocks from the left panel to build your AI project</li>
            <li>Click on blocks to customize their settings</li>
            <li>Test your project with the "Test Run" button</li>
            <li>When ready, click "Publish" to share with the community!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
