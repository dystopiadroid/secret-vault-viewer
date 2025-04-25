import React from "react";
import { Github, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GitHubCornerProps {
  repoUrl?: string;
}

const GitHubCorner: React.FC<GitHubCornerProps> = ({ 
  repoUrl = "https://github.com/dystopiadroid/secret-vault-viewer" 
}) => {
  return (
    <>
      <div className="fixed top-3 right-3 z-50 sm:hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-9 w-9 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all border border-primary/30 hover:border-primary/60 group animate-pulse-glow"
              >
                <Github className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Star us on GitHub!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="fixed top-4 right-4 z-50 hidden sm:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all border border-primary/30 hover:border-primary/60 group animate-pulse-glow"
              >
                <Github className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  Star on GitHub
                </span>
                <Star className="h-3 w-3 text-yellow-500 animate-pulse" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>If you enjoy this app, please star the repository!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default GitHubCorner; 