import Schedule from '../models/Schedule.js';
import { validateSchedule } from '../validators/scheduleValidator.js';
/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Retrieve all schedules
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find();
        if(schedules.length< 1){
            res.json({message: "No schedules yet"})
        }
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single schedule by ID
// @route   GET /api/schedules/:id
// @access  Private
export const getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new schedule
// @route   POST /api/schedules
// @access  Private
export const createSchedule = async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime, courseName } = req.body;
        const { error } = validateSchedule(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const newSchedule = new Schedule({ dayOfWeek, startTime, endTime, courseName });
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a schedule by ID
// @route   PUT /api/schedules/:id
// @access  Private
export const updateSchedule = async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime, courseName } = req.body;
        const { error } = validateSchedule(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        schedule.dayOfWeek = dayOfWeek;
        schedule.startTime = startTime;
        schedule.endTime = endTime;
        schedule.courseName = courseName;
        const updatedSchedule = await schedule.save();
        res.json(updatedSchedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a schedule by ID
// @route   DELETE /api/schedules/:id
// @access  Private
export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        await schedule.remove();
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
