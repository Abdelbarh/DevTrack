var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("devtrack-postgres-data-v2")
    .AddDatabase("devtrack");

builder.AddProject<Projects.DevTrack_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres);

builder.AddNpmApp("web", "../../Frontend", scriptName: "dev")
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
