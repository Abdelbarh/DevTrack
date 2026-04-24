var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.DevTrack_Api>("api");

builder.AddNpmApp("web", "../../Frontend", scriptName: "dev")
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
