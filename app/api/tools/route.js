import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const toolsPath = path.join(process.cwd(), 'data', 'tools.json');

// Helper functions
async function readTools() {
  try {
    const fileContents = await fs.readFile(toolsPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

async function writeTools(tools) {
  await fs.mkdir(path.dirname(toolsPath), { recursive: true });
  await fs.writeFile(toolsPath, JSON.stringify(tools, null, 2));
}

// GET all tools
export async function GET(request) {
  try {
    const tools = await readTools();
    const exportCSV = request.nextUrl.searchParams.get('export');
    
    if (exportCSV) {
      const csvHeader = 'name,category,link,description\n';
      const csvContent = tools.map(tool => 
        `${tool.name},${tool.category},${tool.link},${tool.description}`
      ).join('\n');
      
      return new Response(csvHeader + csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=tools.csv'
        }
      });
    }

    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST handler (combined for both JSON and CSV)
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle CSV Import
    if (contentType?.startsWith('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      const text = await file.text();
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      // Validate CSV format
      const requiredColumns = ['name', 'category', 'link', 'description'];
      if (!records.length || !requiredColumns.every(col => Object.keys(records[0]).includes(col))) {
        return NextResponse.json(
          { error: "Invalid CSV format. Required columns: name,category,link,description" },
          { status: 400 }
        );
      }

      const tools = await readTools();
      
      // Process CSV records
      const newTools = records.map(record => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        name: record.name.trim(),
        category: record.category.trim(),
        link: record.link.trim(),
        description: record.description?.trim() || "",
      })).filter(tool => tool.name && tool.category && tool.link);

      // Check for duplicates
      const existingUrls = new Set(tools.map(t => t.link.toLowerCase()));
      const uniqueTools = newTools.filter(t => !existingUrls.has(t.link.toLowerCase()));

      const updatedTools = [...tools, ...uniqueTools];
      await writeTools(updatedTools);

      return NextResponse.json({
        message: "Import successful",
        imported: uniqueTools.length,
        duplicates: newTools.length - uniqueTools.length
      }, { status: 200 });
    }

    // Handle JSON tool creation
    const tools = await readTools();
    const newTool = await request.json();
    
    // Validate input
    if (!newTool.name || !newTool.category || !newTool.link) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, link' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existingTool = tools.find(t => t.link.toLowerCase() === newTool.link.toLowerCase());
    if (existingTool) {
      return NextResponse.json(
        { error: 'Tool with this link already exists' },
        { status: 409 }
      );
    }

    // Add new tool
    const createdTool = { 
      id: Date.now().toString(), 
      ...newTool 
    };
    tools.push(createdTool);
    await writeTools(tools);

    return NextResponse.json(createdTool, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT update tool
export async function PUT(request) {
  try {
    const tools = await readTools();
    const updatedTool = await request.json();
    
    const index = tools.findIndex(t => t.id === updatedTool.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    tools[index] = updatedTool;
    await writeTools(tools);
    
    return NextResponse.json(updatedTool);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// DELETE tool
export async function DELETE(request) {
  try {
    const tools = await readTools();
    const { id } = await request.json();
    
    const filteredTools = tools.filter(t => t.id !== id);
    if (tools.length === filteredTools.length) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    await writeTools(filteredTools);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
}