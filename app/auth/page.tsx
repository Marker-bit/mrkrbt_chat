import GitHubButton from "./_components/github-button";

export default function AuthPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-secondary/30 p-2">
      {/* <Button variant="ghost" className="absolute top-4 left-4">
        <ArrowLeft />
        Back to chat
      </Button> */}
      <div className="border border-primary/50 bg-primary/10 p-8 rounded-xl flex flex-col items-stretch text-center">
        <h2 className="text-2xl font-bold">Welcome to mrkrbt.chat</h2>
        <p className="text-sm text-muted-foreground">Sign in below</p>
        <GitHubButton />
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
