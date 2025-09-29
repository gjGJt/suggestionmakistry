import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.post('/brainstorm', (req, res) => {
  const prompt = (req.body?.prompt || '').toString();
  const projectId = `proj_${Date.now()}`;
  res.json({
    project_id: projectId,
    brainstorm: {
      project_name: prompt ? `Project: ${prompt.slice(0, 32)}` : 'Demo Project',
      design_one_liner: 'A compact, parametric desktop accessory.',
      key_features: ['Lightweight', 'Parametric', 'Printable'],
      key_functionalities: ['Holds device', 'Anti-slip base'],
      design_components: ['Base', 'Support Arm', 'Cradle'],
      optimal_geometry: { width_mm: 60, depth_mm: 90, height_mm: 80 },
      optimal_material: { body: 'PLA', finish: 'Matte' },
      parametric_information: { wall_thickness_mm: 2.4, fillet_mm: 2 },
    },
  });
});

app.post('/generate-design', (req, res) => {
  const { project_id } = req.body || {};
  res.json({
    project_id: project_id || 'proj_demo',
    cad_version: 1,
    code: '# CadQuery code would be generated server-side',
    blob_url: '/static/placeholder.glb',
  });
});

app.post('/meshing/generate', (req, res) => {
  res.json({ glb_url: '/static/mesh.glb', inp_url: '/static/mesh.inp' });
});

app.post('/prepare-simulation', (req, res) => {
  const { project_id } = req.body || {};
  res.json({
    project_id: project_id || 'proj_demo',
    simulation_version: 1,
    cad_step_version: 1,
    simulation_json: { status: 'prepared', meshes: 1 },
  });
});

app.post('/run-simulation', (req, res) => {
  res.json({ status: 'completed', results: { glb: '/static/results.glb', frd: '/static/results.frd', dat: '/static/results.dat' } });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`API running on http://127.0.0.1:${port}`);
});
