import { Request, Response, NextFunction } from 'express';
import { incidentService } from '../services/incident.service.js';
import { upload } from '../middleware/upload.js';
import {
  validateCoordinates,
  validateIncidentType,
  validateSeverity,
  validateIncidentStatus,
  ValidationError,
} from '../utils/validation.js';

function parseMultipartFormData(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Boolean(req.is('multipart/form-data') || req.is('multipart'))) {
      upload.any()(req, res, (err: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

export async function createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    try {
      await parseMultipartFormData(req, res);
    } catch (uploadErr) {
      const message = uploadErr instanceof Error ? uploadErr.message : 'File upload failed.';
      res.status(400).json({
        status: 'error',
        message,
      });
      return;
    }

    const { type, severity, description, latitude, longitude } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'A non-empty "description" string is required.',
      });
      return;
    }

    const validatedType = validateIncidentType(type);
    const validatedSeverity = validateSeverity(severity);
    const { latitude: validLat, longitude: validLon } = validateCoordinates(latitude, longitude);

    // Extract uploaded files from req.files or req.file
    const uploadedFiles: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      uploadedFiles.push(...req.files);
    } else if (req.files && typeof req.files === 'object') {
      for (const fieldFiles of Object.values(req.files)) {
        if (Array.isArray(fieldFiles)) {
          uploadedFiles.push(...fieldFiles);
        }
      }
    }
    if (req.file) {
      uploadedFiles.push(req.file);
    }

    let photoUrl: string | null = null;
    let photoUrls: string[] = [];

    if (uploadedFiles.length > 0) {
      photoUrls = uploadedFiles.map((f) => `/uploads/${f.filename}`);
      photoUrl = photoUrls[0];
    } else if (req.body.photoUrl || req.body.photoUrls) {
      if (req.body.photoUrls) {
        photoUrls = Array.isArray(req.body.photoUrls)
          ? req.body.photoUrls.map(String)
          : [String(req.body.photoUrls)];
        photoUrl = photoUrls[0] || null;
      } else if (req.body.photoUrl) {
        photoUrl = String(req.body.photoUrl);
        photoUrls = [photoUrl];
      }
    }

    const record = await incidentService.createIncident({
      type: validatedType,
      severity: validatedSeverity,
      description: description.trim(),
      latitude: validLat,
      longitude: validLon,
      photoUrl,
      photoUrls,
    });

    res.status(201).json({
      status: 'success',
      data: record,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

export async function listIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, severity, type } = req.query;

    const filters: { status?: string; severity?: string; type?: string } = {};
    if (status) filters.status = validateIncidentStatus(status);
    if (severity) filters.severity = validateSeverity(severity);
    if (type) filters.type = validateIncidentType(type);

    const geoJson = await incidentService.listIncidents(filters);
    res.json(geoJson);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

export async function updateIncidentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        status: 'error',
        message: 'A "status" field is required in request body.',
      });
      return;
    }

    const validStatus = validateIncidentStatus(status);
    const updated = await incidentService.updateIncidentStatus(id, validStatus);

    if (!updated) {
      res.status(404).json({
        status: 'error',
        message: `Incident with ID "${id}" was not found.`,
      });
      return;
    }

    res.json({
      status: 'success',
      data: updated,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }
    next(err);
  }
}
