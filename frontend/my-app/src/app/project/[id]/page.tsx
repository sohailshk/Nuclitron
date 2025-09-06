import React from "react";

type ProjectsProps = {
  params: {
    id: string;
  };
};

const Projects = ({ params }: ProjectsProps) => {
  return (
    <div>
      <h1>This is project no {params.id}</h1>
    </div>
  );
};

export default Projects;
